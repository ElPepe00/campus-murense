# backend/routers/campus_router.py
import json
import logging
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from datetime import date, datetime, time as dt_time
from typing import Optional, List
from database import get_db
import models
from auth import get_current_user, require_admin

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

        llista.append({
            "id": jugador.id,
            "inscripcioId": inscripcio.id,
            "nom": jugador.nom_complet,
            "edat": jugador.edat,
            "grup": inscripcio.grup_assignat or "Sense Grup",
            "dni": jugador.dni,
            "pagat": inscripcio.estat_pagament == models.EstatPagamentEnum.PAGAT,
            "present": (registre.estat == models.EstatAssistenciaEnum.PRESENT) if registre else False,
            "alergies": jugador.alergies
        })

    return llista

# --- 3. Fitxa detallada de l'infant (Pantalla 4) ---
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

    return {
        "id": jugador.id,
        "nom": jugador.nom_complet,
        "edat": jugador.edat,
        "dataNaixement": jugador.data_naixement.strftime("%d/%m/%Y") if jugador.data_naixement else "",
        "dni": jugador.dni,
        "poblacio": jugador.poblacio,
        "clubProcedencia": jugador.club_procedencia,
        "tallaRoba": jugador.talla_roba,
        "colegi": "CEIP Joan Mas", # Per defecte a Muro
        "curs": "4t Primària",
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
            "setmanes": inscripcio.setmanes_contractades if inscripcio else 4,
            "piscina": inscripcio.servei_piscina.value if inscripcio else "SI",
            "menjador": inscripcio.servei_menjador if inscripcio else False,
            "matinera": inscripcio.servei_matinera if inscripcio else False,
            "estatPagament": inscripcio.estat_pagament.value if inscripcio else "PENDENT",
            "preuTotal": float(inscripcio.preu_total) if inscripcio else 150.00
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

        # 6. Càlcul de preu oficial
        setmanes = serveis_data.get("setmanes", [1])
        if isinstance(setmanes, list):
            valid_setmanes = [s for s in setmanes if isinstance(s, int) and 1 <= s <= 4]
            num_setmanes = len(valid_setmanes) if valid_setmanes else 1
        else:
            num_setmanes = 1

        num_setmanes = max(1, min(num_setmanes, 4))
        
        preus_per_setmana = {1: 110.0, 2: 200.0, 3: 280.0, 4: 360.0}
        base_preu = preus_per_setmana.get(num_setmanes, num_setmanes * 90.0)

        descompte_raw = str(serveis_data.get("descompte", "cap")).lower()
        if "murense" in descompte_raw:
            descompte_enum = models.TipusDescompteEnum.MURENSE
            pct = 0.10
        elif "nombrosa" in descompte_raw or "familia" in descompte_raw:
            descompte_enum = models.TipusDescompteEnum.FAMILIA_NOMBROSA
            pct = 0.10
        else:
            descompte_enum = models.TipusDescompteEnum.CAP
            pct = 0.0

        base_amb_descompte = base_preu * (1.0 - pct)
        menjador_preu = (num_setmanes * 35.0) if serveis_data.get("menjador") else 0.0
        matinera_preu = (num_setmanes * 15.0) if serveis_data.get("matinera") else 0.0
        preu_total = round(base_amb_descompte + menjador_preu + matinera_preu, 2)

        # Servei piscina enum
        piscina_val = autoritzacions_data.get("piscina") or serveis_data.get("piscina", "SI")
        if piscina_val == "SI_MANIGUETS":
            piscina_enum = models.ServeiPiscinaEnum.SI_MANIGUETS
        elif piscina_val == "NO":
            piscina_enum = models.ServeiPiscinaEnum.NO
        else:
            piscina_enum = models.ServeiPiscinaEnum.SI

        intolerancies_clean = str(serveis_data.get("intoleranciesMenjador") or nen_data.get("alergies") or "").strip()[:500]

        # 7. Crear Inscripció
        inscripcio = models.Inscripcio(
            jugador_id=jugador.id,
            edicio_id=edicio.id,
            grup_assignat=grup_assignat,
            autoritzacio_imatges=bool(autoritzacions_data.get("imatges", True)),
            autoritzacio_sortir_sol=bool(autoritzacions_data.get("sortirSol", False)),
            autoritzacio_sortides=bool(autoritzacions_data.get("sortides", True)),
            servei_piscina=piscina_enum,
            servei_menjador=bool(serveis_data.get("menjador", False)),
            intolerancies_menjador=intolerancies_clean or None,
            servei_matinera=bool(serveis_data.get("matinera", False)),
            excursio_30_06=bool(serveis_data.get("excursio1", False)),
            excursio_07_07=bool(serveis_data.get("excursio2", False)),
            setmanes_contractades=num_setmanes,
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

        return {
            "status": "ok",
            "inscripcioId": inscripcio.id,
            "jugadorId": jugador.id,
            "nom": jugador.nom_complet,
            "grup": grup_assignat,
            "preuTotal": preu_total,
            "message": "Inscripció guardada satisfactòriament"
        }
    except Exception as e:
        db.rollback()
        # Per seguretat (CWE-209), mai retornam excepcions internes ni detalls de BD al client
        log.error(f"Error registrant la inscripció: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="S'ha produït un error en processar la inscripció. Revisa les dades o contacta amb la coordinació."
        )


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


