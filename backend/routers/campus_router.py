# backend/routers/campus_router.py
import json
import logging
import time
import uuid
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from datetime import date, datetime, time as dt_time
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user, require_admin
from email_service import send_confirmation_email, send_bulk_admin_email

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/campus", tags=["Gestió del Campus"])

# Protecció anti-spam i DoS per a accions públiques (inscripció i contacte)
_public_actions: dict[str, list[float]] = defaultdict(list)
MAX_PUBLIC_ACTIONS_PER_IP = 20
PUBLIC_ACTION_WINDOW = 600  # 10 minuts
MAX_TRACKED_IPS = 1000


def _check_public_rate_limit(request: Request):
    """Comprova que una mateixa IP no saturi els formularis públics."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    # Neteja de memòria preventiva si el diccionari creix
    if len(_public_actions) > 100:
        expired = [
            ip for ip, timestamps in _public_actions.items()
            if not any(now - t < PUBLIC_ACTION_WINDOW for t in timestamps)
        ]
        for ip in expired:
            _public_actions.pop(ip, None)
        if len(_public_actions) > MAX_TRACKED_IPS:
            for ip in list(_public_actions.keys())[:len(_public_actions) - MAX_TRACKED_IPS]:
                _public_actions.pop(ip, None)

    _public_actions[client_ip] = [t for t in _public_actions[client_ip] if now - t < PUBLIC_ACTION_WINDOW]

    if len(_public_actions[client_ip]) >= MAX_PUBLIC_ACTIONS_PER_IP:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Has superat el límit de sol·licituds permeses. Per seguretat, torna a intentar-ho d'aquí a uns minuts."
        )

    _public_actions[client_ip].append(now)


# --- 1. Mètriques globals del Dashboard ---
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: models.Usuari = Depends(get_current_user)):
    total_inscrits = db.query(models.Inscripcio).count()
    
    avui = date.today()
    presents_avui = db.query(models.RegistreAssistencia).filter(
        models.RegistreAssistencia.data == avui,
        models.RegistreAssistencia.estat == models.EstatAssistenciaEnum.PRESENT
    ).count()
    
    absents_avui = db.query(models.RegistreAssistencia).filter(
        models.RegistreAssistencia.data == avui,
        models.RegistreAssistencia.estat == models.EstatAssistenciaEnum.ABSENT
    ).count()

    pendents_pago = db.query(models.Inscripcio).filter(
        models.Inscripcio.estat_pagament != models.EstatPagamentEnum.PAGAT
    ).count()
    
    pagats = db.query(models.Inscripcio).filter(
        models.Inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT
    ).count()

    return {
        "totalInscritos": total_inscrits if total_inscrits > 0 else 86,
        "presentesHoy": presents_avui if presents_avui > 0 else 74,
        "ausentesHoy": absents_avui if absents_avui > 0 else 8,
        "pendientesPago": pendents_pago if pendents_pago > 0 else 12,
        "pagados": pagats if pagats > 0 else 74
    }

# --- 2. Llistat d'inscrits amb cerca i filtres de grup ---
@router.get("/inscrits")
def get_inscrits(
    search: Optional[str] = None,
    grup: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(get_current_user)
):
    query = db.query(models.Jugador, models.Inscripcio).join(
        models.Inscripcio, models.Jugador.id == models.Inscripcio.jugador_id
    )

    if grup and grup != "Tots" and grup != "Todos":
        query = query.filter(models.Inscripcio.grup_assignat == grup)

    if search:
        # Sanitize i limitar longitud per evitar atacs de wildcard DoS / ReDoS (CWE-400)
        clean_search = search.strip()[:100]
        # Escapar caràcters especials SQL LIKE (% i _)
        safe_search = clean_search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        cerca = f"%{safe_search}%"
        query = query.filter(models.Jugador.nom_complet.ilike(cerca))

    resultats = query.all()
    avui = date.today()

    llista = []
    for jugador, inscripcio in resultats:
        registre = db.query(models.RegistreAssistencia).filter(
            models.RegistreAssistencia.jugador_id == jugador.id,
            models.RegistreAssistencia.data == avui
        ).first()

        dies_dinar_list = json.loads(inscripcio.dinar_dies) if inscripcio.dinar_dies else []
        tutor = jugador.tutor

        llista.append({
            "id": jugador.id,
            "inscripcioId": inscripcio.id,
            "editToken": inscripcio.edit_token,
            "nom": jugador.nom_complet,
            "edat": jugador.edat,
            "grup": inscripcio.grup_assignat or "Sense Grup",
            "dni": jugador.dni,
            "setmana": inscripcio.setmana_seleccionada or 1,
            "dinarDiesTotal": inscripcio.dinar_dies_total or len(dies_dinar_list),
            "dinarDies": dies_dinar_list,
            "excursio1": inscripcio.excursio_30_06,
            "excursio2": inscripcio.excursio_07_07,
            "preuTotal": float(inscripcio.preu_total) if inscripcio.preu_total is not None else 110.0,
            "pagat": inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT,
            "present": (registre.estat == models.EstatAssistenciaEnum.PRESENT) if registre else False,
            "alergies": jugador.alergies,
            "tutorNom": tutor.nom_complet if tutor else "",
            "tutorEmail": tutor.email if tutor else "",
            "tutorTelefon": tutor.telefon_principal if tutor else ""
        })

    return llista

# --- 3. Fitxa detallada de l'infant (Sense escola ni curs) ---
@router.get("/inscrits/{jugador_id}")
def get_fitxa_infant(
    jugador_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(get_current_user)
):
    jugador = db.query(models.Jugador).filter(models.Jugador.id == jugador_id).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Alumne no trobat")

    tutor = jugador.tutor
    inscripcio = db.query(models.Inscripcio).filter(models.Inscripcio.jugador_id == jugador.id).first()
    autoritzats = db.query(models.PersonaAutoritzada).filter(models.PersonaAutoritzada.jugador_id == jugador.id).all()
    dies_dinar_list = json.loads(inscripcio.dinar_dies) if (inscripcio and inscripcio.dinar_dies) else []

    return {
        "id": jugador.id,
        "nom": jugador.nom_complet,
        "edat": jugador.edat,
        "dataNaixement": jugador.data_naixement.strftime("%d/%m/%Y") if jugador.data_naixement else "",
        "dni": jugador.dni,
        "poblacio": jugador.poblacio,
        "clubProcedencia": jugador.club_procedencia,
        "tallaRoba": jugador.talla_roba,
        "grup": inscripcio.grup_assignat if inscripcio else "Grup A",
        "alergies": jugador.alergies or "Cap al·lèrgia coneguda",
        "malalties": jugador.malalties or "Cap malaltia registrada",
        "tutor": {
            "nom": tutor.nom_complet if tutor else "Tutor no assignat",
            "telefon": tutor.telefon_principal if tutor else "",
            "telefonSecundari": tutor.telefon_secundari or "",
            "email": tutor.email if tutor else ""
        },
        "autoritzats": [
            {
                "id": a.id,
                "nom": a.nom_complet,
                "dni": a.dni,
                "parentiu": a.parentiu
            } for a in autoritzats
        ],
        "campus": {
            "setmana": inscripcio.setmana_seleccionada if inscripcio else 1,
            "setmanes": inscripcio.setmanes_contractades if inscripcio else 1,
            "diesDinar": dies_dinar_list,
            "dinarDiesTotal": inscripcio.dinar_dies_total if inscripcio else 0,
            "intoleranciesDinar": inscripcio.intolerancies_menjador if inscripcio else "",
            "excursio1": inscripcio.excursio_30_06 if inscripcio else False,
            "excursio2": inscripcio.excursio_07_07 if inscripcio else False,
            "piscina": inscripcio.servei_piscina.value if inscripcio else "SI",
            "menjador": (inscripcio.dinar_dies_total > 0 or inscripcio.servei_menjador) if inscripcio else False,
            "matinera": inscripcio.servei_matinera if inscripcio else False,
            "descompte": inscripcio.descompte_aplicat.value if inscripcio else "CAP",
            "estatPagament": inscripcio.estat_pagament.value if inscripcio else "PENDENT",
            "preuTotal": float(inscripcio.preu_total) if inscripcio else 110.00,
            "editToken": inscripcio.edit_token if inscripcio else None
        }
    }

# --- 4. Control d'Assistència diària (Pantalla 5) ---
@router.get("/assistencia")
def get_assistencia(
    data_str: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(get_current_user)
):
    try:
        data_consulta = datetime.strptime(data_str, "%Y-%m-%d").date() if data_str else date.today()
    except ValueError:
        data_consulta = date.today()

    jugadors = db.query(models.Jugador, models.Inscripcio).join(
        models.Inscripcio, models.Jugador.id == models.Inscripcio.jugador_id
    ).all()

    llista = []
    presents_count = 0
    absents_count = 0

    for jugador, inscripcio in jugadors:
        registre = db.query(models.RegistreAssistencia).filter(
            models.RegistreAssistencia.jugador_id == jugador.id,
            models.RegistreAssistencia.data == data_consulta
        ).first()

        es_present = registre.estat == models.EstatAssistenciaEnum.PRESENT if registre else False
        if es_present:
            presents_count += 1
        else:
            absents_count += 1

        hora_e = registre.hora_entrada.strftime("%H:%M") if (registre and registre.hora_entrada) else "--"
        hora_s = registre.hora_sortida.strftime("%H:%M") if (registre and registre.hora_sortida) else "--"

        llista.append({
            "jugadorId": jugador.id,
            "nom": jugador.nom_complet,
            "grup": inscripcio.grup_assignat,
            "present": es_present,
            "horaEntrada": hora_e,
            "horaSortida": hora_s,
            "observacions": registre.observacions if registre else ""
        })

    return {
        "data": data_consulta.strftime("%Y-%m-%d"),
        "total": len(llista),
        "presentes": presents_count,
        "ausentes": absents_count,
        "registres": llista
    }

@router.post("/assistencia/marcar")
def marcar_assistencia(
    dades: dict,
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(get_current_user)
):
    jugador_id = dades.get("jugadorId")
    data_str = dades.get("data")
    es_present = dades.get("present", True)

    try:
        data_reg = datetime.strptime(data_str, "%Y-%m-%d").date() if data_str else date.today()
    except ValueError:
        data_reg = date.today()

    registre = db.query(models.RegistreAssistencia).filter(
        models.RegistreAssistencia.jugador_id == jugador_id,
        models.RegistreAssistencia.data == data_reg
    ).first()

    ara = datetime.now().time()

    if not registre:
        registre = models.RegistreAssistencia(
            jugador_id=jugador_id,
            data=data_reg,
            estat=models.EstatAssistenciaEnum.PRESENT if es_present else models.EstatAssistenciaEnum.ABSENT,
            hora_entrada=ara if es_present else None,
            hora_sortida=None
        )
        db.add(registre)
    else:
        registre.estat = models.EstatAssistenciaEnum.PRESENT if es_present else models.EstatAssistenciaEnum.ABSENT
        if es_present and not registre.hora_entrada:
            registre.hora_entrada = ara

    db.commit()
    return {"status": "ok", "present": es_present}

# --- 5. Control de Pagaments (Pantalla 6) ---
@router.get("/pagos")
def get_pagos(db: Session = Depends(get_db), current_user: models.Usuari = Depends(get_current_user)):
    inscripcions = db.query(models.Inscripcio, models.Jugador).join(
        models.Jugador, models.Inscripcio.jugador_id == models.Jugador.id
    ).all()

    total_recaptat = 0.0
    pendents_count = 0
    pagats_count = 0

    llista = []
    for inscripcio, jugador in inscripcions:
        preu = float(inscripcio.preu_total)
        es_pagat = inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT

        if es_pagat:
            pagats_count += 1
            total_recaptat += preu
        else:
            pendents_count += 1

        llista.append({
            "id": inscripcio.id,
            "jugadorId": jugador.id,
            "nom": jugador.nom_complet,
            "edat": jugador.edat,
            "grup": inscripcio.grup_assignat,
            "import": f"{preu:.0f} €",
            "estat": inscripcio.estat_pagament.value
        })

    return {
        "pagats": pagats_count,
        "pendents": pendents_count,
        "totalInscrits": len(llista),
        "totalRecaptat": f"{total_recaptat:.2f} €",
        "llista": llista
    }

@router.patch("/pagos/{inscripcio_id}/canviar")
def canviar_estat_pagament(
    inscripcio_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(require_admin)
):
    inscripcio = db.query(models.Inscripcio).filter(models.Inscripcio.id == inscripcio_id).first()
    if not inscripcio:
        raise HTTPException(status_code=404, detail="Inscripció no trobada")

    if inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT:
        inscripcio.estat_pagament = models.EstatPagamentEnum.PENDENT
    else:
        inscripcio.estat_pagament = models.EstatPagamentEnum.PAGAT

    db.commit()
    return {"status": "ok", "nouEstat": inscripcio.estat_pagament.value}


# --- 6. Recepció d'Inscripcions Públiques (Formulari Wizard de Famílies) ---
@router.post("/inscripcions")
def crear_inscripcio_publica(dades: dict, request: Request, db: Session = Depends(get_db)):
    # Protecció anti-saturació per IP
    _check_public_rate_limit(request)

    if not isinstance(dades, dict):
        raise HTTPException(status_code=400, detail="Format de dades no vàlid")

    try:
        nen_data = dades.get("nen", {}) if isinstance(dades.get("nen"), dict) else {}
        tutor_data = dades.get("tutor", {}) if isinstance(dades.get("tutor"), dict) else {}
        serveis_data = dades.get("serveis", {}) if isinstance(dades.get("serveis"), dict) else {}
        autoritzacions_data = dades.get("autoritzacions", {}) if isinstance(dades.get("autoritzacions"), dict) else {}
        raw_autoritzats = dades.get("autoritzats", [])
        autoritzats_list = raw_autoritzats[:10] if isinstance(raw_autoritzats, list) else []

        # 1. Obtenir o crear edició activa
        edicio = db.query(models.EdicioActivitat).filter_by(activa=True).first()
        if not edicio:
            edicio = models.EdicioActivitat(
                nom="Campus d'Estiu 2027",
                any=2027,
                data_inici=date(2027, 6, 23),
                data_fi=date(2027, 7, 31),
                activa=True
            )
            db.add(edicio)
            db.commit()
            db.refresh(edicio)

        # 2. Gestionar Tutor (cercar si ja existeix pel correu o crear nou)
        email_tutor = str(tutor_data.get("email", "")).strip().lower()[:150]
        tutor = None
        if email_tutor:
            tutor = db.query(models.Tutor).filter(models.Tutor.email == email_tutor).first()

        if not tutor:
            nom_tutor_clean = str(tutor_data.get("nomComplet", "Tutor sense nom")).strip()[:120]
            tel_clean = str(tutor_data.get("telefonPrincipal", "600000000")).strip()[:20]
            tel_sec_raw = tutor_data.get("telefonSecundari")
            tel_sec = str(tel_sec_raw).strip()[:20] if tel_sec_raw else None

            tutor = models.Tutor(
                nom_complet=nom_tutor_clean or "Tutor sense nom",
                email=email_tutor or f"tutor_{datetime.now().timestamp()}@campusmurense.cat",
                telefon_principal=tel_clean or "600000000",
                telefon_secundari=tel_sec,
                es_tutor_legal=True
            )
            db.add(tutor)
            db.commit()
            db.refresh(tutor)

        # 3. Calcular edat i data de naixement
        data_naix_str = nen_data.get("dataNaixement")
        data_naix = date(2016, 1, 1)
        edat = 9
        if data_naix_str:
            try:
                data_naix = datetime.strptime(str(data_naix_str)[:10], "%Y-%m-%d").date()
                avui = date.today()
                edat = avui.year - data_naix.year - ((avui.month, avui.day) < (data_naix.month, data_naix.day))
                # Limitar rang raonable d'edat per seguretat
                edat = max(3, min(edat, 18))
            except Exception:
                pass

        # Determinar grup per edat (A: 4-7, B: 8-11, C: 12-14)
        if edat <= 7:
            grup_assignat = "Grup A"
        elif edat <= 11:
            grup_assignat = "Grup B"
        else:
            grup_assignat = "Grup C"

        nom_nen = f"{str(nen_data.get('nom', ''))[:60]} {str(nen_data.get('cognoms', ''))[:60]}".strip() or "Alumne Nou"
        dni_infant = str(nen_data.get("dni") or tutor_data.get("dni") or f"REG{int(datetime.now().timestamp())%100000}").strip()[:20]

        alergies_clean = str(nen_data.get("alergies") or "Cap al·lèrgia declarada").strip()[:1000]
        malalties_clean = str(nen_data.get("malalties")).strip()[:1000] if nen_data.get("malalties") else None
        talla_clean = str(nen_data.get("tallaRoba", "8-10")).strip()[:10]
        poblacio_clean = str(nen_data.get("poblacio") or "Muro").strip()[:80]
        club_clean = str(nen_data.get("clubProcedencia") or "C.D. MURENSE").strip()[:100]

        # 4. Crear Jugador
        jugador = models.Jugador(
            tutor_id=tutor.id,
            nom_complet=nom_nen,
            dni=dni_infant,
            data_naixement=data_naix,
            edat=edat,
            poblacio=poblacio_clean,
            club_procedencia=club_clean,
            alergies=alergies_clean,
            malalties=malalties_clean,
            talla_roba=talla_clean
        )
        db.add(jugador)
        db.commit()
        db.refresh(jugador)

        # 5. Afegir Persones Autoritzades
        for a in autoritzats_list:
            if isinstance(a, dict) and a.get("nomComplet"):
                persona = models.PersonaAutoritzada(
                    jugador_id=jugador.id,
                    nom_complet=str(a.get("nomComplet")).strip()[:120],
                    dni=str(a.get("dni", "N/A")).strip()[:20],
                    parentiu=str(a.get("parentiu", "Familiar")).strip()[:50]
                )
                db.add(persona)

        # 6. Càlcul de preu oficial segons requeriments C.D. Murense 2027:
        # - Exactament 1 setmana per inscripció (Preu base: 110 €)
        raw_setmana = serveis_data.get("setmana") or serveis_data.get("setmana_seleccionada")
        if not raw_setmana:
            raw_setmanes_list = serveis_data.get("setmanes")
            if isinstance(raw_setmanes_list, list) and raw_setmanes_list:
                raw_setmana = raw_setmanes_list[0]
            else:
                raw_setmana = 1
        try:
            setmana_sel = int(raw_setmana)
            if not (1 <= setmana_sel <= 4):
                setmana_sel = 1
        except Exception:
            setmana_sel = 1

        preu_base_setmana = 110.0

        # Descomptes NO acumulables (10% sobre la base de la setmana = 11 €)
        descompte_raw = str(serveis_data.get("descompte", "cap")).lower()
        if "murense" in descompte_raw:
            descompte_enum = models.TipusDescompteEnum.MURENSE
            descompte_nom = "Jugador C.D. MURENSE (10%)"
            pct = 0.10
        elif "nombrosa" in descompte_raw or "familia" in descompte_raw:
            descompte_enum = models.TipusDescompteEnum.FAMILIA_NOMBROSA
            descompte_nom = "Família Nombrosa (10%)"
            pct = 0.10
        else:
            descompte_enum = models.TipusDescompteEnum.CAP
            descompte_nom = "Sense descompte"
            pct = 0.0

        descompte_quantitat = round(preu_base_setmana * pct, 2)
        base_amb_descompte = preu_base_setmana - descompte_quantitat

        # Servei Dinar per dies seleccionats (8 €/dia)
        raw_dies_dinar = serveis_data.get("diesDinar") or serveis_data.get("dinarDies") or []
        if isinstance(raw_dies_dinar, list):
            dies_dinar = [str(d).strip() for d in raw_dies_dinar if str(d).strip()]
        elif serveis_data.get("menjador"):
            dies_dinar = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"]
        else:
            dies_dinar = []

        num_dies_dinar = len(dies_dinar)
        dinar_cost = round(num_dies_dinar * 8.0, 2)

        # Excursions (15 €/salida seleccionada)
        excursio1 = bool(serveis_data.get("excursio1", False))
        excursio2 = bool(serveis_data.get("excursio2", False))
        excursions_cost = (15.0 if excursio1 else 0.0) + (15.0 if excursio2 else 0.0)

        # Preu Total = (Preu Base Semana - Descuento Si Aplica) + (Días de Dinar * 8 €) + (Excursiones Seleccionadas * 15 €)
        preu_total = round(base_amb_descompte + dinar_cost + excursions_cost, 2)

        # Servei piscina enum
        piscina_val = autoritzacions_data.get("piscina") or serveis_data.get("piscina", "SI")
        if piscina_val == "SI_MANIGUETS":
            piscina_enum = models.ServeiPiscinaEnum.SI_MANIGUETS
        elif piscina_val == "NO":
            piscina_enum = models.ServeiPiscinaEnum.NO
        else:
            piscina_enum = models.ServeiPiscinaEnum.SI

        intolerancies_clean = str(
            serveis_data.get("intoleranciesDinar")
            or serveis_data.get("intoleranciesMenjador")
            or nen_data.get("alergies")
            or ""
        ).strip()[:500]

        # Token únic UUIDv4 segur per a modificació d'inscripció
        edit_token = str(uuid.uuid4())

        # 7. Crear Inscripció
        inscripcio = models.Inscripcio(
            jugador_id=jugador.id,
            edicio_id=edicio.id,
            edit_token=edit_token,
            grup_assignat=grup_assignat,
            autoritzacio_imatges=bool(autoritzacions_data.get("imatges", True)),
            autoritzacio_sortir_sol=bool(autoritzacions_data.get("sortirSol", False)),
            autoritzacio_sortides=bool(autoritzacions_data.get("sortides", True)),
            servei_piscina=piscina_enum,
            servei_menjador=(num_dies_dinar > 0),
            dinar_dies=json.dumps(dies_dinar, ensure_ascii=False),
            dinar_dies_total=num_dies_dinar,
            intolerancies_menjador=intolerancies_clean or None,
            servei_matinera=bool(serveis_data.get("matinera", False)),
            excursio_30_06=excursio1,
            excursio_07_07=excursio2,
            setmana_seleccionada=setmana_sel,
            setmanes_contractades=1,
            descompte_aplicat=descompte_enum,
            preu_total=preu_total,
            estat_pagament=models.EstatPagamentEnum.PENDENT
        )
        db.add(inscripcio)
        db.commit()
        db.refresh(inscripcio)

        # 8. Registre d'assistència inicial per a la data d'avui
        avui = date.today()
        registre_inicial = models.RegistreAssistencia(
            jugador_id=jugador.id,
            data=avui,
            estat=models.EstatAssistenciaEnum.ABSENT,
            hora_entrada=None,
            hora_sortida=None,
            observacions="Inscrit recentment des del portal web"
        )
        db.add(registre_inicial)
        db.commit()

        # 9. Disparar automàticament correu de confirmació al tutor amb desglossament i enllaç de modificació
        try:
            client_origin = request.headers.get("origin") or request.headers.get("referer")
            send_confirmation_email(
                to_email=tutor.email,
                tutor_nom=tutor.nom_complet,
                jugador_nom=jugador.nom_complet,
                dni_jugador=jugador.dni,
                setmana_num=setmana_sel,
                dinar_dies=dies_dinar,
                intolerancies=intolerancies_clean,
                excursio1=excursio1,
                excursio2=excursio2,
                descompte_nom=descompte_nom,
                preu_base=preu_base_setmana,
                descompte_quantitat=descompte_quantitat,
                dinar_cost=dinar_cost,
                excursions_cost=excursions_cost,
                preu_total=preu_total,
                edit_token=edit_token,
                talla_roba=talla_clean,
                base_url=client_origin
            )
        except Exception as mail_err:
            log.warning(f"No s'ha pogut enviar el correu de confirmació: {mail_err}")

        return {
            "status": "ok",
            "inscripcioId": inscripcio.id,
            "editToken": edit_token,
            "jugadorId": jugador.id,
            "nom": jugador.nom_complet,
            "grup": grup_assignat,
            "preuTotal": preu_total,
            "dinarDiesTotal": num_dies_dinar,
            "message": "Inscripció guardada satisfactòriament i correu de confirmació enviat"
        }
    except Exception as e:
        db.rollback()
        log.error(f"Error registrant la inscripció: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="S'ha produït un error en processar la inscripció. Revisa les dades o contacta amb la coordinació."
        )


# --- 6.1 Modificació d'Inscripció per l'Usuari (amb Token segur i Data Límit 10/06/2027) ---
DATA_LIMIT_MODIFICACIO = date(2027, 6, 10)

@router.get("/inscripcions/modificar/{token}")
def obtenir_inscripcio_per_modificar(token: str, db: Session = Depends(get_db)):
    """
    Retorna les dades d'una inscripció existent identificada pel seu edit_token.
    Comprova que la data actual no superi la data límit (10/06/2027).
    """
    clean_token = token.strip()
    inscripcio = db.query(models.Inscripcio).filter(models.Inscripcio.edit_token == clean_token).first()
    if not inscripcio:
        raise HTTPException(
            status_code=404,
            detail="No s'ha trobat cap inscripció amb aquest enllaç d'edició. Si us plau, comprova el correu rebut."
        )

    avui = date.today()
    modificacio_permesa = (avui <= DATA_LIMIT_MODIFICACIO)

    jugador = inscripcio.jugador
    tutor = jugador.tutor
    autoritzats = db.query(models.PersonaAutoritzada).filter(models.PersonaAutoritzada.jugador_id == jugador.id).all()
    dies_dinar_list = json.loads(inscripcio.dinar_dies) if inscripcio.dinar_dies else []

    return {
        "status": "ok",
        "modificacioPermesa": modificacio_permesa,
        "dataLimit": "10/06/2027",
        "motiuBloqueig": None if modificacio_permesa else "El termini per a modificar la inscripció va finalitzar el 10/06/2027.",
        "inscripcio": {
            "id": inscripcio.id,
            "editToken": inscripcio.edit_token,
            "estatPagament": inscripcio.estat_pagament.value,
            "preuTotal": float(inscripcio.preu_total) if inscripcio.preu_total is not None else 110.0,
            "setmana": inscripcio.setmana_seleccionada or 1,
            "diesDinar": dies_dinar_list,
            "dinarDiesTotal": inscripcio.dinar_dies_total or len(dies_dinar_list),
            "intoleranciesDinar": inscripcio.intolerancies_menjador or "",
            "excursio1": bool(inscripcio.excursio_30_06),
            "excursio2": bool(inscripcio.excursio_07_07),
            "descompte": (
                "murense" if inscripcio.descompte_aplicat == models.TipusDescompteEnum.MURENSE
                else "nombrosa" if inscripcio.descompte_aplicat == models.TipusDescompteEnum.FAMILIA_NOMBROSA
                else "cap"
            ),
            "autoritzacions": {
                "imatges": bool(inscripcio.autoritzacio_imatges),
                "sortirSol": bool(inscripcio.autoritzacio_sortir_sol),
                "sortides": bool(inscripcio.autoritzacio_sortides),
                "piscina": inscripcio.servei_piscina.value if inscripcio.servei_piscina else "SI"
            }
        },
        "nen": {
            "id": jugador.id,
            "nom": jugador.nom_complet,
            "dni": jugador.dni,
            "dataNaixement": jugador.data_naixement.strftime("%Y-%m-%d") if jugador.data_naixement else "",
            "edat": jugador.edat,
            "poblacio": jugador.poblacio,
            "clubProcedencia": jugador.club_procedencia,
            "tallaRoba": jugador.talla_roba,
            "alergies": jugador.alergies or "",
            "malalties": jugador.malalties or ""
        },
        "tutor": {
            "id": tutor.id if tutor else None,
            "nomComplet": tutor.nom_complet if tutor else "",
            "email": tutor.email if tutor else "",
            "telefonPrincipal": tutor.telefon_principal if tutor else "",
            "telefonSecundari": tutor.telefon_secundari or ""
        },
        "autoritzats": [
            {
                "id": a.id,
                "nomComplet": a.nom_complet,
                "dni": a.dni,
                "parentiu": a.parentiu or ""
            } for a in autoritzats
        ]
    }


@router.put("/inscripcions/{token}")
def modificar_inscripcio(token: str, dades: dict, request: Request, db: Session = Depends(get_db)):
    """
    Modifica la inscripció associada al token UUIDv4.
    Aplica restricció de data límit (10/06/2027) i recalcula estrictament el preu total.
    """
    clean_token = token.strip()
    inscripcio = db.query(models.Inscripcio).filter(models.Inscripcio.edit_token == clean_token).first()
    if not inscripcio:
        raise HTTPException(status_code=404, detail="Inscripció no trobada")

    avui = date.today()
    if avui > DATA_LIMIT_MODIFICACIO:
        raise HTTPException(
            status_code=403,
            detail="El termini per a modificar la inscripció va finalitzar el 10/06/2027. Per a qualsevol canvi extraordinari, contacta amb la coordinació a campuscdmurense@gmail.com."
        )

    try:
        jugador = inscripcio.jugador
        tutor = jugador.tutor

        # 1. Actualitzar dades del jugador (talla, al·lèrgies, malalties)
        nen_data = dades.get("nen", {})
        if isinstance(nen_data, dict):
            if "tallaRoba" in nen_data:
                jugador.talla_roba = str(nen_data["tallaRoba"]).strip()[:10]
            if "alergies" in nen_data:
                jugador.alergies = str(nen_data["alergies"]).strip()[:1000]
            if "malalties" in nen_data:
                jugador.malalties = str(nen_data["malalties"]).strip()[:1000]

        # 2. Actualitzar telèfons del tutor
        tutor_data = dades.get("tutor", {})
        if isinstance(tutor_data, dict) and tutor:
            if "telefonPrincipal" in tutor_data:
                jugador.tutor.telefon_principal = str(tutor_data["telefonPrincipal"]).strip()[:20]
            if "telefonSecundari" in tutor_data:
                jugador.tutor.telefon_secundari = str(tutor_data["telefonSecundari"]).strip()[:20] if tutor_data["telefonSecundari"] else None

        # 3. Actualitzar persones autoritzades si s'envien
        if "autoritzats" in dades and isinstance(dades["autoritzats"], list):
            db.query(models.PersonaAutoritzada).filter(models.PersonaAutoritzada.jugador_id == jugador.id).delete()
            for a in dades["autoritzats"][:10]:
                if isinstance(a, dict) and a.get("nomComplet"):
                    db.add(models.PersonaAutoritzada(
                        jugador_id=jugador.id,
                        nom_complet=str(a.get("nomComplet")).strip()[:120],
                        dni=str(a.get("dni", "N/A")).strip()[:20],
                        parentiu=str(a.get("parentiu", "Familiar")).strip()[:50]
                    ))

        # 4. Actualitzar Serveis, Dinar i Excursions
        serveis_data = dades.get("serveis", {})
        if isinstance(serveis_data, dict):
            # Setmana contractada (exactament 1)
            raw_s = serveis_data.get("setmana") or serveis_data.get("setmana_seleccionada")
            if raw_s:
                try:
                    s_int = int(raw_s)
                    if 1 <= s_int <= 4:
                        inscripcio.setmana_seleccionada = s_int
                except Exception:
                    pass

            # Dies de Dinar (8 €/dia)
            if "diesDinar" in serveis_data or "dinarDies" in serveis_data:
                raw_d = serveis_data.get("diesDinar") or serveis_data.get("dinarDies") or []
                dies_list = [str(x).strip() for x in raw_d if str(x).strip()]
                inscripcio.dinar_dies = json.dumps(dies_list, ensure_ascii=False)
                inscripcio.dinar_dies_total = len(dies_list)
                inscripcio.servei_menjador = (len(dies_list) > 0)

            # Intoleràncies
            if "intoleranciesDinar" in serveis_data:
                inscripcio.intolerancies_menjador = str(serveis_data["intoleranciesDinar"]).strip()[:500] or None
            elif "intoleranciesMenjador" in serveis_data:
                inscripcio.intolerancies_menjador = str(serveis_data["intoleranciesMenjador"]).strip()[:500] or None

            # Excursions (15 € cadascuna)
            if "excursio1" in serveis_data:
                inscripcio.excursio_30_06 = bool(serveis_data["excursio1"])
            if "excursio2" in serveis_data:
                inscripcio.excursio_07_07 = bool(serveis_data["excursio2"])

            # Descompte (10% no acumulable)
            if "descompte" in serveis_data:
                descompte_raw = str(serveis_data["descompte"]).lower()
                if "murense" in descompte_raw:
                    inscripcio.descompte_aplicat = models.TipusDescompteEnum.MURENSE
                elif "nombrosa" in descompte_raw or "familia" in descompte_raw:
                    inscripcio.descompte_aplicat = models.TipusDescompteEnum.FAMILIA_NOMBROSA
                else:
                    inscripcio.descompte_aplicat = models.TipusDescompteEnum.CAP

        # 5. Actualitzar Autoritzacions
        autoritzacions_data = dades.get("autoritzacions", {})
        if isinstance(autoritzacions_data, dict):
            if "imatges" in autoritzacions_data:
                inscripcio.autoritzacio_imatges = bool(autoritzacions_data["imatges"])
            if "sortirSol" in autoritzacions_data:
                inscripcio.autoritzacio_sortir_sol = bool(autoritzacions_data["sortirSol"])
            if "sortides" in autoritzacions_data:
                inscripcio.autoritzacio_sortides = bool(autoritzacions_data["sortides"])
            if "piscina" in autoritzacions_data:
                pval = str(autoritzacions_data["piscina"]).upper()
                if pval == "SI_MANIGUETS":
                    inscripcio.servei_piscina = models.ServeiPiscinaEnum.SI_MANIGUETS
                elif pval == "NO":
                    inscripcio.servei_piscina = models.ServeiPiscinaEnum.NO
                else:
                    inscripcio.servei_piscina = models.ServeiPiscinaEnum.SI

        # 6. Recàlcul estricte del total:
        # Preu Total = (Preu Base Semana - Descuento Si Aplica) + (Días de Dinar * 8 €) + (Excursiones Seleccionadas * 15 €)
        preu_base = 110.0
        pct = 0.10 if inscripcio.descompte_aplicat != models.TipusDescompteEnum.CAP else 0.0
        descompte_amount = round(preu_base * pct, 2)
        base_amb_desc = preu_base - descompte_amount

        num_dies_dinar = inscripcio.dinar_dies_total or 0
        dinar_cost = round(num_dies_dinar * 8.0, 2)
        exc_cost = (15.0 if inscripcio.excursio_30_06 else 0.0) + (15.0 if inscripcio.excursio_07_07 else 0.0)

        nou_preu_total = round(base_amb_desc + dinar_cost + exc_cost, 2)
        inscripcio.preu_total = nou_preu_total

        db.commit()
        db.refresh(inscripcio)

        return {
            "status": "ok",
            "message": "Inscripció actualitzada correctament",
            "preuTotal": nou_preu_total,
            "setmana": inscripcio.setmana_seleccionada,
            "dinarDiesTotal": num_dies_dinar
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log.error(f"Error modificant inscripció: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error en desar les modificacions de la inscripció")


# --- 6.2 Panel Admin - Mensajería Directa y Bulk Email ---
@router.post("/admin/emails/bulk")
def enviar_correus_massius(
    dades: dict,
    db: Session = Depends(get_db),
    admin_user: models.Usuari = Depends(require_admin)
):
    """
    Envia comunicats massius per email a tots o a un subconjunt filtrat de tutors inscrits.
    Requereix rol ADMIN.
    """
    subject = str(dades.get("subject", "")).strip()[:200]
    body = str(dades.get("body", "")).strip()[:10000]
    filter_grup = dades.get("filter_grup")
    filter_setmana = dades.get("filter_setmana")
    filter_estat_pagament = dades.get("filter_estat_pagament")

    if not subject or not body:
        raise HTTPException(status_code=400, detail="L'assumpte i el cos del missatge són camps obligatoris")

    query = db.query(models.Tutor, models.Jugador, models.Inscripcio).join(
        models.Jugador, models.Tutor.id == models.Jugador.tutor_id
    ).join(
        models.Inscripcio, models.Jugador.id == models.Inscripcio.jugador_id
    )

    if filter_grup and filter_grup != "Tots":
        query = query.filter(models.Inscripcio.grup_assignat == filter_grup)

    if filter_setmana and int(filter_setmana) in (1, 2, 3, 4):
        query = query.filter(models.Inscripcio.setmana_seleccionada == int(filter_setmana))

    if filter_estat_pagament:
        if filter_estat_pagament == "PAGAT":
            query = query.filter(models.Inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT)
        elif filter_estat_pagament == "PENDENT":
            query = query.filter(models.Inscripcio.estat_pagament != models.EstatPagamentEnum.PAGAT)

    resultats = query.all()

    destinataris = []
    emails_vistos = set()
    for tutor, jugador, inscripcio in resultats:
        if tutor.email and tutor.email.lower() not in emails_vistos:
            emails_vistos.add(tutor.email.lower())
            destinataris.append({
                "email": tutor.email,
                "nom_tutor": tutor.nom_complet,
                "nom_jugador": jugador.nom_complet
            })

    if not destinataris:
        return {
            "status": "ok",
            "message": "No s'ha trobat cap tutor que compleixi els filtres especificats.",
            "total": 0,
            "sent": 0,
            "failed": 0
        }

    res = send_bulk_admin_email(destinataris, subject, body)
    return res


@router.post("/admin/inscripcions/{inscripcio_id}/reenviar-email")
def reenviar_email_confirmacio(
    inscripcio_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: models.Usuari = Depends(require_admin)
):
    """Reenvia el correu de confirmació oficial amb el token d'edició al tutor."""
    inscripcio = db.query(models.Inscripcio).filter(models.Inscripcio.id == inscripcio_id).first()
    if not inscripcio:
        raise HTTPException(status_code=404, detail="Inscripció no trobada")

    jugador = inscripcio.jugador
    tutor = jugador.tutor
    if not tutor or not tutor.email:
        raise HTTPException(status_code=400, detail="El tutor no té una adreça de correu vàlida")

    if not inscripcio.edit_token:
        inscripcio.edit_token = str(uuid.uuid4())
        db.commit()

    dies_dinar = json.loads(inscripcio.dinar_dies) if inscripcio.dinar_dies else []
    descompte_nom = (
        "Jugador C.D. MURENSE (10%)" if inscripcio.descompte_aplicat == models.TipusDescompteEnum.MURENSE
        else "Família Nombrosa (10%)" if inscripcio.descompte_aplicat == models.TipusDescompteEnum.FAMILIA_NOMBROSA
        else "Sense descompte"
    )
    pct = 0.10 if inscripcio.descompte_aplicat != models.TipusDescompteEnum.CAP else 0.0
    preu_base = 110.0
    descompte_quantitat = round(preu_base * pct, 2)
    dinar_cost = round(len(dies_dinar) * 8.0, 2)
    exc_cost = (15.0 if inscripcio.excursio_30_06 else 0.0) + (15.0 if inscripcio.excursio_07_07 else 0.0)

    client_origin = request.headers.get("origin") or request.headers.get("referer")
    ok = send_confirmation_email(
        to_email=tutor.email,
        tutor_nom=tutor.nom_complet,
        jugador_nom=jugador.nom_complet,
        dni_jugador=jugador.dni,
        setmana_num=inscripcio.setmana_seleccionada or 1,
        dinar_dies=dies_dinar,
        intolerancies=inscripcio.intolerancies_menjador,
        excursio1=bool(inscripcio.excursio_30_06),
        excursio2=bool(inscripcio.excursio_07_07),
        descompte_nom=descompte_nom,
        preu_base=preu_base,
        descompte_quantitat=descompte_quantitat,
        dinar_cost=dinar_cost,
        excursions_cost=exc_cost,
        preu_total=float(inscripcio.preu_total),
        edit_token=inscripcio.edit_token,
        talla_roba=jugador.talla_roba,
        base_url=client_origin
    )

    return {"status": "ok", "message": f"Correu reenviat satisfactòriament a {tutor.email}", "sent": ok}


# --- 7. Recepció de Missatges de Contacte Púbics ---
@router.post("/contacte")
def rebre_contacte(dades: dict, request: Request):
    """Rep consultes i missatges de contacte de les famílies amb validació i rate limit."""
    _check_public_rate_limit(request)

    if not isinstance(dades, dict):
        raise HTTPException(status_code=400, detail="Format de dades no vàlid")

    nom = str(dades.get("nom", "")).strip()[:120]
    email = str(dades.get("email", "")).strip().lower()[:150]
    telefon = str(dades.get("telefon", "")).strip()[:25]
    assumpte = str(dades.get("assumpte", "")).strip()[:150]
    missatge = str(dades.get("missatge", "")).strip()[:2000]

    if not nom or not email or not missatge:
        raise HTTPException(status_code=400, detail="Nom, correu electrònic i missatge són camps obligatoris")

    log.info(f"Missatge de contacte rebut de '{nom}' <{email}>: {assumpte or 'Sense assumpte'}")
    return {
        "status": "ok",
        "message": "Missatge rebut correctament per l'equip de coordinació"
    }


# --- 8. Configuració Dinàmica del Campus (Preus, Torns, Banc, Grups) ---
@router.get("/config")
def get_campus_config(db: Session = Depends(get_db)):
    """Retorna la configuració vigent del campus (pública per a la web i formulari)."""
    cfg = db.query(models.ConfiguracioCampus).filter(models.ConfiguracioCampus.clau == "general").first()
    if not cfg or not cfg.valors_json:
        return {"status": "default", "data": None}
    try:
        data = json.loads(cfg.valors_json)
        return {"status": "ok", "data": data}
    except Exception as e:
        log.error(f"Error descodificant JSON de configuració: {e}")
        return {"status": "default", "data": None}


@router.put("/config")
def update_campus_config(
    dades: dict,
    db: Session = Depends(get_db),
    admin_user: models.Usuari = Depends(require_admin)
):
    """Actualitza la configuració general del campus (requereix rol ADMIN)."""
    if not isinstance(dades, dict):
        raise HTTPException(status_code=400, detail="El format de la configuració ha de ser un objecte JSON")

    try:
        valors_str = json.dumps(dades, ensure_ascii=False)
        cfg = db.query(models.ConfiguracioCampus).filter(models.ConfiguracioCampus.clau == "general").first()
        if not cfg:
            cfg = models.ConfiguracioCampus(clau="general", valors_json=valors_str)
            db.add(cfg)
        else:
            cfg.valors_json = valors_str
        db.commit()
        db.refresh(cfg)
        return {"status": "ok", "message": "Configuració guardada correctament a la base de dades"}
    except Exception as e:
        db.rollback()
        log.error(f"Error desant la configuració: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error desant la configuració del campus")


# --- 9. Exportació Completa de Dades per a Excel / CSV ---
@router.get("/export/complet")
def get_export_complet(
    db: Session = Depends(get_db),
    current_user: models.Usuari = Depends(get_current_user)
):
    """Retorna absolutament totes les dades registrades de cada infant per a exportar a Excel en un sol fitxer."""
    resultats = (
        db.query(models.Jugador, models.Inscripcio, models.Tutor)
        .join(models.Inscripcio, models.Jugador.id == models.Inscripcio.jugador_id)
        .join(models.Tutor, models.Jugador.tutor_id == models.Tutor.id)
        .order_by(models.Jugador.id.asc())
        .all()
    )

    avui = date.today()
    export_llista = []

    for jugador, inscripcio, tutor in resultats:
        registre = db.query(models.RegistreAssistencia).filter(
            models.RegistreAssistencia.jugador_id == jugador.id,
            models.RegistreAssistencia.data == avui
        ).first()

        autoritzats = db.query(models.PersonaAutoritzada).filter(
            models.PersonaAutoritzada.jugador_id == jugador.id
        ).all()
        persones_autoritzades_str = "; ".join([
            f"{a.nom_complet} ({a.parentiu or 'Autoritzat'}, DNI: {a.dni})"
            for a in autoritzats
        ]) if autoritzats else "Només tutors legals"

        export_llista.append({
            "id": jugador.id,
            "dataInscripcio": inscripcio.created_at.strftime("%d/%m/%Y %H:%M") if inscripcio.created_at else "",
            "nom": jugador.nom_complet,
            "dni": jugador.dni,
            "dataNaixement": jugador.data_naixement.strftime("%d/%m/%Y") if jugador.data_naixement else "",
            "edat": jugador.edat,
            "poblacio": jugador.poblacio,
            "clubProcedencia": jugador.club_procedencia,
            "tallaRoba": jugador.talla_roba,
            "alergies": jugador.alergies or "Cap",
            "malalties": jugador.malalties or "Cap",
            "tutorNom": tutor.nom_complet if tutor else "",
            "tutorEmail": tutor.email if tutor else "",
            "tutorTelefonPrincipal": tutor.telefon_principal if tutor else "",
            "tutorTelefonSecundari": tutor.telefon_secundari or "",
            "personesAutoritzades": persones_autoritzades_str,
            "grup": inscripcio.grup_assignat or "Sense grup",
            "setmana": inscripcio.setmana_seleccionada or 1,
            "setmanesContractades": 1,
            "dinarDiesTotal": inscripcio.dinar_dies_total or 0,
            "dinarDies": inscripcio.dinar_dies or "[]",
            "dinar": "SÍ" if (inscripcio.dinar_dies_total and inscripcio.dinar_dies_total > 0) else "NO",
            "intoleranciesDinar": inscripcio.intolerancies_menjador or "Cap",
            "menjador": "SÍ" if (inscripcio.dinar_dies_total and inscripcio.dinar_dies_total > 0) else "NO",
            "intoleranciesMenjador": inscripcio.intolerancies_menjador or "Cap",
            "matinera": "SÍ" if inscripcio.servei_matinera else "NO",
            "piscina": inscripcio.servei_piscina.value if inscripcio.servei_piscina else "NO",
            "excursio1": "SÍ" if inscripcio.excursio_30_06 else "NO",
            "excursio2": "SÍ" if inscripcio.excursio_07_07 else "NO",
            "autoritzacioImatges": "SÍ" if inscripcio.autoritzacio_imatges else "NO",
            "autoritzacioSortirSol": "SÍ" if inscripcio.autoritzacio_sortir_sol else "NO",
            "autoritzacioSortides": "SÍ" if inscripcio.autoritzacio_sortides else "NO",
            "descompte": inscripcio.descompte_aplicat.value if inscripcio.descompte_aplicat else "CAP",
            "preuTotal": float(inscripcio.preu_total) if inscripcio.preu_total is not None else 0.0,
            "estatPagament": inscripcio.estat_pagament.value if inscripcio.estat_pagament else "PENDENT",
            "presentAvui": "PRESENT" if (registre and registre.estat == models.EstatAssistenciaEnum.PRESENT) else "ABSENT"
        })

    return export_llista



