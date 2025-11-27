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
    #monto:float
    descripcion:str

class RegisterModel(BaseModel):
    descripcion: Optional[str] = None
    fecha_inicio:str
    fecha_fin: str
    id_tipo_evento:int
    

class EventCreateModel(BaseModel):
    id_tipo_evento: int
    fecha_inicio: str
    fecha_fin:str
    celebrado:List[CelebratedModel]
    participantes: List[ParticipantModel]

class ParroquialEvent(BaseModel):
    fecha_inicio:str
    fecha_fin: str
    descripcion:str


class StatusEvent(BaseModel):
    id_evento: int
    image:Optional[str] = Field(default=None)
    status: str


class ChangeDate(BaseModel):
    fecha_inicio: str
    fecha_fin: str
    id_evento:int


class ResponseHrsDisponibles(BaseModel):
    fecha:str
    hrs_disponibles:List[str]



class CelebradoUpdate(BaseModel):
    id_celebrado: Optional[int] = None  # Si viene, es UPDATE; si no, es INSERT
    nombres: str
    apellido_pat: str
    apellido_mat: str
    id_rol: int
    genero: str
    fecha_nac: str
    edad: int

class ParticipanteUpdate(BaseModel):
    id_evento_participante: Optional[int] = None  # Si viene, es UPDATE; si no, es INSERT
    nombres: str
    apellido_pat: str
    apellido_mat: str
    id_rol: int


class EventoUpdate(BaseModel):
    id_evento: int
    id_tipo_evento: int
    fecha_inicio: str
    fecha_fin: str
    celebrados: List[CelebradoUpdate]
    participantes: List[ParticipanteUpdate]

