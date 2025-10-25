from pydantic import BaseModel,Field
from typing import Optional, List





class ParticipantModel(BaseModel):
    nombres:str
    apellido_pat:str
    apellido_mat: str
    id_rol: int



class CelebratedModel(ParticipantModel):
    genero: str
    fecha_nac:str
    edad:int

class Pago(BaseModel):
    monto:float
    descripcion:str


class EventCreateModel(BaseModel):
    id_tipo_evento: int
    fecha_inicio: str
    fecha_fin:str
    celebrado:List[CelebratedModel]
    participantes: List[ParticipantModel]
    pago:Pago

class ParroquialEvent(BaseModel):
    fecha_inicio:str
    fecha_fin: str
    descripcion:str


class StatusEvent(BaseModel):
    id_evento: int
    image:Optional[str] = Field(default=None)
    status: str
