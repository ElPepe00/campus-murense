# backend/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List
from models import RolUsuariEnum

class InscripcioCreate(BaseModel):
    # Dades Personals (sense escola ni curs)
    email: EmailStr
    nom_jugador: str
    nom_tutor_formulari: str
    dni_jugador: str
    edat_jugador: int
    data_naixement: date
    poblacio: str
    club_procedencia: Optional[str] = "C.D. MURENSE"
    alergies: Optional[str] = None
    malalties: Optional[str] = None
    nom_representant_legal: str
    telefon_contacte_1: str
    telefon_contacte_2: Optional[str] = None
    persones_autoritzades_recollida: Optional[str] = None

    # Autoritzacions
    autoritzacio_imatges: bool = True
    autoritzacio_sortir_sol: bool = False
    autoritzacio_sortides_club: bool = True
    servei_piscina: str = "SI"  # "SI", "NO", "SI_MANIGUETS"

    # Roba
    talla_samarreta: str = "8-10"

    # Nova Lògica de Serveis i Tarifes (1 sola setmana per inscripció)
    setmana_seleccionada: int = 1  # 1, 2, 3 o 4
    dies_dinar: List[str] = []      # Llista de dates per a dinar (8 €/dia)
    intolerancies_alimentaries: Optional[str] = None

    # Descompte (10% no acumulable: CAP, MURENSE, FAMILIA_NOMBROSA)
    tipus_descompte: str = "CAP"

    # Excursions (15 €/sortida)
    excursio_30_06: bool = False
    excursio_07_07: bool = False

    # Camps opcionals legacy
    servei_matinera: bool = False
    servei_menjador: bool = False
    setmanes_contractades: Optional[int] = 1


class InscripcioUpdate(BaseModel):
    # Permet a les famílies modificar dades abans de la data límit (10/06/2027)
    telefon_contacte_1: Optional[str] = None
    telefon_contacte_2: Optional[str] = None
    persones_autoritzades_recollida: Optional[str] = None
    
    alergies: Optional[str] = None
    malalties: Optional[str] = None
    talla_samarreta: Optional[str] = None

    setmana_seleccionada: Optional[int] = None
    dies_dinar: Optional[List[str]] = None
    intolerancies_alimentaries: Optional[str] = None

    excursio_30_06: Optional[bool] = None
    excursio_07_07: Optional[bool] = None

    tipus_descompte: Optional[str] = None

    autoritzacio_imatges: Optional[bool] = None
    autoritzacio_sortir_sol: Optional[bool] = None
    autoritzacio_sortides_club: Optional[bool] = None
    servei_piscina: Optional[str] = None


class InscripcioResponse(InscripcioCreate):
    id: int
    edit_token: Optional[str] = None
    created_at: datetime
    preu_total: float
    estat_pagament: str

    class Config:
        from_attributes = True


class BulkEmailRequest(BaseModel):
    subject: str
    body: str
    filter_grup: Optional[str] = None          # "Tots", "Grup A", "Grup B", "Grup C"
    filter_setmana: Optional[int] = None       # None, 1, 2, 3, 4
    filter_estat_pagament: Optional[str] = None # None, "PAGAT", "PENDENT"


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