from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional, List


class EventModel(BaseModel):
    id_usuario: int
    folio: str
    id_tipo_evento:int
    fecha: str
    id_tipo_evento: int

class ParticipantModel(BaseModel):
    id_evento:int
    nombres:str
    apellido_pat:str
    apellido_mat: str
    id_rol: int



class CelebratedModel(ParticipantModel):
    genero: str
    fecha_nac:str
    edad:int

class Pago(BaseModel):
    fecha_hora:str
    monto:float
    descripcion:str
