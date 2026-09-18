# backend/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional
from models import RolUsuariEnum

class InscripcioCreate(BaseModel):
    # Dades Personals
    email: EmailStr
    nom_jugador: str
    nom_tutor_formulari: str
    dni_jugador: str
    edat_jugador: int
    data_naixement: date
    poblacio: str
    club_procedencia: Optional[str] = None
    alergies: Optional[str] = None
    malalties: Optional[str] = None
    nom_representant_legal: str
    telefon_contacte_1: str
    telefon_contacte_2: Optional[str] = None
    persones_autoritzades_recollida: Optional[str] = None

    # Autoritzacions
    autoritzacio_imatges: bool
    autoritzacio_sortir_sol: bool
    autoritzacio_sortides_club: bool
    servei_piscina: str  # "SI", "NO", "SI_MANIGUETS"

    # Roba
    talla_samarreta: str

    # Serveis Extra
    servei_menjador: bool
    intolerancies_alimentaries: Optional[str] = None
    servei_matinera: bool

    # Cost i opcions
    setmanes_contractades: int  # 1, 2, 3, 4
    tipus_descompte: str        # "CAP", "MURENSE", "FAMILIA_NOMBROSA"

    # Excursions
    excursio_30_06: bool
    excursio_07_07: bool

class InscripcioResponse(InscripcioCreate):
    id: int
    created_at: datetime
    preu_total: float
    estat_pagament: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    rol: Optional[str] = None

class UsuariBase(BaseModel):
    nom_complet: str
    email: EmailStr
    rol: RolUsuariEnum

class UsuariCreate(UsuariBase):
    password: str

class UsuariResponse(UsuariBase):
    id: int
    actiu: bool

    class Config:
        from_attributes = True