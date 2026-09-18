# backend/models.py
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, 
    ForeignKey, Numeric, Enum, Text, Time, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
import enum
from database import Base

# --- Enums del Sistema ---

class RolUsuariEnum(str, enum.Enum):
    ADMIN = "ADMIN"        # Accés total (coordinador, gestió econòmica, configuració)
    MONITOR = "MONITOR"    # Accés de lectura de fitxes i marcatge d'assistència

class ServeiPiscinaEnum(str, enum.Enum):
    SI = "SI"
    NO = "NO"
    SI_MANIGUETS = "SI_MANIGUETS"

class TipusDescompteEnum(str, enum.Enum):
    CAP = "CAP"
    MURENSE = "MURENSE"
    FAMILIA_NOMBROSA = "FAMILIA_NOMBROSA"

class EstatPagamentEnum(str, enum.Enum):
    PENDENT = "PENDENT"
    REVISIO = "REVISIO"
    PAGAT = "PAGAT"
    REBUTJAT = "REBUTJAT"

class TipusDocumentEnum(str, enum.Enum):
    DNI = "DNI"
    TARGETA_SANITARIA = "TARGETA_SANITARIA"
    JUSTIFICANT_PAGAMENT = "JUSTIFICANT_PAGAMENT"

class EstatAssistenciaEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    JUSTIFICAT = "JUSTIFICAT"


# --- Gestió d'Usuaris Administratius / Staff ---

class Usuari(Base):
    """Usuaris del panell d'administració (coordinadors, directiva, monitors)."""
    __tablename__ = "usuaris"

    id = Column(Integer, primary_key=True, index=True)
    nom_complet = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(RolUsuariEnum), default=RolUsuariEnum.MONITOR, nullable=False)
    actiu = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())


# --- Entitats Principals del Club ---

class Tutor(Base):
    __tablename__ = "tutors"

    id = Column(Integer, primary_key=True, index=True)
    nom_complet = Column(String(120), nullable=False)
    email = Column(String(150), nullable=False, index=True)
    telefon_principal = Column(String(20), nullable=False)
    telefon_secundari = Column(String(20), nullable=True)
    es_tutor_legal = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    jugadors = relationship("Jugador", back_populates="tutor")


class Jugador(Base):
    __tablename__ = "jugadors"

    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)
    
    nom_complet = Column(String(120), nullable=False)
    dni = Column(String(20), nullable=False, index=True)
    data_naixement = Column(Date, nullable=False)
    edat = Column(Integer, nullable=False)
    poblacio = Column(String(80), nullable=False)
    club_procedencia = Column(String(100), default="C.D. MURENSE")
    
    alergies = Column(Text, nullable=True)
    malalties = Column(Text, nullable=True)
    talla_roba = Column(String(10), nullable=False)
    
    created_at = Column(DateTime, default=func.now())

    tutor = relationship("Tutor", back_populates="jugadors")
    persones_autoritzades = relationship("PersonaAutoritzada", back_populates="jugador", cascade="all, delete-orphan")
    inscripcions = relationship("Inscripcio", back_populates="jugador")
    registres_assistencia = relationship("RegistreAssistencia", back_populates="jugador")


class PersonaAutoritzada(Base):
    __tablename__ = "persones_autoritzades"

    id = Column(Integer, primary_key=True, index=True)
    jugador_id = Column(Integer, ForeignKey("jugadors.id"), nullable=False)
    nom_complet = Column(String(120), nullable=False)
    dni = Column(String(20), nullable=False)
    parentiu = Column(String(50), nullable=True)

    jugador = relationship("Jugador", back_populates="persones_autoritzades")


# --- Gestió d'Esdeveniments i Grups ---

class EdicioActivitat(Base):
    __tablename__ = "edicions_activitat"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)  # Ex: "Campus d'Estiu 2027"
    any = Column(Integer, nullable=False, default=2027)
    data_inici = Column(Date, nullable=True)
    data_fi = Column(Date, nullable=True)
    activa = Column(Boolean, default=True)

    inscripcions = relationship("Inscripcio", back_populates="edicio")


# --- Inscripcions i Detall del Campus ---

class Inscripcio(Base):
    __tablename__ = "inscripcions"

    id = Column(Integer, primary_key=True, index=True)
    jugador_id = Column(Integer, ForeignKey("jugadors.id"), nullable=False)
    edicio_id = Column(Integer, ForeignKey("edicions_activitat.id"), nullable=False)
    
    # Grup assignat al campus (Grup A, Grup B, etc., tal com surt a la pantalla 3 d'image_2.png)
    grup_assignat = Column(String(20), nullable=True)

    # Autoritzacions
    autoritzacio_imatges = Column(Boolean, default=False)
    autoritzacio_sortir_sol = Column(Boolean, default=False)
    autoritzacio_sortides = Column(Boolean, default=False)
    servei_piscina = Column(Enum(ServeiPiscinaEnum), default=ServeiPiscinaEnum.NO)

    # Serveis Extra
    servei_menjador = Column(Boolean, default=False)
    intolerancies_menjador = Column(Text, nullable=True)
    servei_matinera = Column(Boolean, default=False)
    
    # Excursions
    excursio_30_06 = Column(Boolean, default=False)
    excursio_07_07 = Column(Boolean, default=False)

    # Tarifes i Pagament
    setmanes_contractades = Column(Integer, nullable=False)
    descompte_aplicat = Column(Enum(TipusDescompteEnum), default=TipusDescompteEnum.CAP)
    preu_total = Column(Numeric(10, 2), nullable=False)
    estat_pagament = Column(Enum(EstatPagamentEnum), default=EstatPagamentEnum.PENDENT)

    created_at = Column(DateTime, default=func.now())

    jugador = relationship("Jugador", back_populates="inscripcions")
    edicio = relationship("EdicioActivitat", back_populates="inscripcions")
    documents = relationship("DocumentAdjunt", back_populates="inscripcio", cascade="all, delete-orphan")


class DocumentAdjunt(Base):
    __tablename__ = "documents_adjunts"

    id = Column(Integer, primary_key=True, index=True)
    inscripcio_id = Column(Integer, ForeignKey("inscripcions.id"), nullable=False)
    tipus_document = Column(Enum(TipusDocumentEnum), nullable=False)
    drive_file_id = Column(String(100), nullable=False)
    nom_arxiu_original = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

    inscripcio = relationship("Inscripcio", back_populates="documents")


# --- Control d'Assistència Diària (Pantalla 5 de la referència) ---

class RegistreAssistencia(Base):
    """Registre diari d'assistència per a cada nin."""
    __tablename__ = "registres_assistencia"

    id = Column(Integer, primary_key=True, index=True)
    jugador_id = Column(Integer, ForeignKey("jugadors.id"), nullable=False)
    data = Column(Date, nullable=False, index=True)
    estat = Column(Enum(EstatAssistenciaEnum), default=EstatAssistenciaEnum.PRESENT)
    hora_entrada = Column(Time, nullable=True)
    hora_sortida = Column(Time, nullable=True)
    observacions = Column(String(255), nullable=True)

    jugador = relationship("Jugador", back_populates="registres_assistencia")

    # Evita que es repeteixi més d'un registre pel mateix nin en el mateix dia
    __table_args__ = (
        UniqueConstraint('jugador_id', 'data', name='uix_jugador_dia'),
    )