# backend/seed_data.py
from datetime import date, time, datetime
from database import SessionLocal
import models

def seed():
    db = SessionLocal()
    try:
        # 1. Comprovar si ja hi ha edició
        edicio = db.query(models.EdicioActivitat).filter_by(any=2027).first()
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

        # Si ja hi ha jugadors, no duplicar
        if db.query(models.Jugador).count() > 0:
            print("La base de dades ja té jugadors carregats.")
            return

        # Dades d'alumnes extretes fidelment de la maqueta
        alumnes_mock = [
            {
                "nom": "Martín García López",
                "edat": 10,
                "grup": "Grup A",
                "dni": "43219876A",
                "data_naixement": date(2015, 5, 12),
                "colegi": "CEIP Son Ferrer",
                "curs": "4t Primària",
                "tutor": "Laura López",
                "telefon": "654 321 987",
                "email": "laura.lopez@email.com",
                "pagat": True,
                "present": True,
                "hora_entrada": time(9, 2),
                "hora_sortida": time(14, 3),
                "alergies": "Cap al·lèrgia coneguda",
                "preu": 150.00
            },
            {
                "nom": "Lucía Pérez Ramos",
                "edat": 9,
                "grup": "Grup A",
                "dni": "43218765B",
                "data_naixement": date(2016, 8, 20),
                "colegi": "CEIP Joan Mas",
                "curs": "3r Primària",
                "tutor": "Carlos Pérez",
                "telefon": "611 223 344",
                "email": "carlos.perez@email.com",
                "pagat": True,
                "present": True,
                "hora_entrada": time(9, 5),
                "hora_sortida": time(14, 2),
                "alergies": "Intolerància a la lactosa",
                "preu": 150.00
            },
            {
                "nom": "Hugo Torres Vidal",
                "edat": 11,
                "grup": "Grup B",
                "dni": "43217654C",
                "data_naixement": date(2014, 2, 14),
                "colegi": "Col·legi Sant Francesc",
                "curs": "5è Primària",
                "tutor": "Margarita Vidal",
                "telefon": "622 334 455",
                "email": "marga.vidal@email.com",
                "pagat": False,
                "present": False,
                "hora_entrada": None,
                "hora_sortida": None,
                "alergies": "Asma estacional",
                "preu": 150.00
            },
            {
                "nom": "Sofía Ramírez Serra",
                "edat": 8,
                "grup": "Grup B",
                "dni": "43216543D",
                "data_naixement": date(2017, 11, 5),
                "colegi": "CEIP Joan Mas",
                "curs": "2n Primària",
                "tutor": "Antoni Ramírez",
                "telefon": "633 445 566",
                "email": "antoni.ramirez@email.com",
                "pagat": True,
                "present": True,
                "hora_entrada": time(9, 15),
                "hora_sortida": time(14, 5),
                "alergies": "Al·lèrgia als fruits secs",
                "preu": 150.00
            },
            {
                "nom": "Daniel Ruiz Font",
                "edat": 10,
                "grup": "Grup C",
                "dni": "43215432E",
                "data_naixement": date(2015, 9, 30),
                "colegi": "CEIP Can Picafort",
                "curs": "4t Primària",
                "tutor": "Jaume Ruiz",
                "telefon": "644 556 677",
                "email": "jaume.ruiz@email.com",
                "pagat": True,
                "present": False,
                "hora_entrada": None,
                "hora_sortida": None,
                "alergies": "Cap",
                "preu": 150.00
            },
            {
                "nom": "Paula Sánchez Mir",
                "edat": 9,
                "grup": "Grup C",
                "dni": "43214321F",
                "data_naixement": date(2016, 4, 18),
                "colegi": "CEIP Joan Mas",
                "curs": "3r Primària",
                "tutor": "Maria Mir",
                "telefon": "655 667 788",
                "email": "maria.mir@email.com",
                "pagat": False,
                "present": True,
                "hora_entrada": time(9, 10),
                "hora_sortida": time(14, 0),
                "alergies": "Cap",
                "preu": 150.00
            },
            {
                "nom": "Álex Fernández Pons",
                "edat": 12,
                "grup": "Grup A",
                "dni": "43213210G",
                "data_naixement": date(2013, 1, 25),
                "colegi": "IES Muro",
                "curs": "1r ESO",
                "tutor": "Pere Fernández",
                "telefon": "666 778 899",
                "email": "pere.fernandez@email.com",
                "pagat": True,
                "present": True,
                "hora_entrada": time(9, 12),
                "hora_sortida": time(14, 4),
                "alergies": "Cap",
                "preu": 150.00
            },
            {
                "nom": "Claudia Gómez Morro",
                "edat": 11,
                "grup": "Grup B",
                "dni": "43212109H",
                "data_naixement": date(2014, 7, 19),
                "colegi": "CEIP Son Ferrer",
                "curs": "5è Primària",
                "tutor": "Elena Morro",
                "telefon": "677 889 900",
                "email": "elena.morro@email.com",
                "pagat": False,
                "present": False,
                "hora_entrada": None,
                "hora_sortida": None,
                "alergies": "Diabetis Tipus 1 (atenció pautes menjador)",
                "preu": 150.00
            }
        ]

        avui = date.today()

        for item in alumnes_mock:
            # Tutor
            tutor = models.Tutor(
                nom_complet=item["tutor"],
                email=item["email"],
                telefon_principal=item["telefon"],
                telefon_secundari=None,
                es_tutor_legal=True
            )
            db.add(tutor)
            db.commit()
            db.refresh(tutor)

            # Jugador
            jugador = models.Jugador(
                tutor_id=tutor.id,
                nom_complet=item["nom"],
                dni=item["dni"],
                data_naixement=item["data_naixement"],
                edat=item["edat"],
                poblacio="Muro",
                club_procedencia="C.D. MURENSE",
                alergies=item["alergies"],
                malalties=None,
                talla_roba="10-12"
            )
            db.add(jugador)
            db.commit()
            db.refresh(jugador)

            # Persona Autoritzada
            autoritzat = models.PersonaAutoritzada(
                jugador_id=jugador.id,
                nom_complet=f"{item['tutor']} (Tutor Legal)",
                dni=item["dni"].replace("A", "Z"),
                parentiu="Pare/Mare"
            )
            db.add(autoritzat)

            # Inscripció
            inscripcio = models.Inscripcio(
                jugador_id=jugador.id,
                edicio_id=edicio.id,
                grup_assignat=item["grup"],
                autoritzacio_imatges=True,
                autoritzacio_sortir_sol=False,
                autoritzacio_sortides=True,
                servei_piscina=models.ServeiPiscinaEnum.SI,
                servei_menjador=True,
                intolerancies_menjador=item["alergies"] if "lactosa" in item["alergies"] else None,
                servei_matinera=True,
                excursio_30_06=True,
                excursio_07_07=True,
                setmanes_contractades=4,
                descompte_aplicat=models.TipusDescompteEnum.MURENSE,
                preu_total=item["preu"],
                estat_pagament=models.EstatPagamentEnum.PAGAT if item["pagat"] else models.EstatPagamentEnum.PENDENT
            )
            db.add(inscripcio)
            db.commit()

            # Registre d'assistència d'avui
            registre = models.RegistreAssistencia(
                jugador_id=jugador.id,
                data=avui,
                estat=models.EstatAssistenciaEnum.PRESENT if item["present"] else models.EstatAssistenciaEnum.ABSENT,
                hora_entrada=item["hora_entrada"],
                hora_sortida=item["hora_sortida"],
                observacions="Arribada puntual" if item["present"] else "Sense avisar"
            )
            db.add(registre)
            db.commit()

        print("Dades d'exemple carregades correctament!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
