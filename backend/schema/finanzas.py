from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List


class Comprobante(BaseModel):
    id_evento: int
    nombre:str
    correo:EmailStr
    concepto:str
    monto:float
    fecha:str


class Pago(BaseModel):
    monto:float
    descripcion:str
    categoria:int


class Gasto(Pago):
    pass


class Transaccion_class(BaseModel):
    monto: float
    id_categoria: int
    descripcion: str
    categoria: int

