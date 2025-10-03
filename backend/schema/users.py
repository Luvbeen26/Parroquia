from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    es_admin: Optional[bool] = False


class RegisterUser(UserBase):
    contra: str
    confirm_pswd: str

class LoginUser(BaseModel):
    correo: EmailStr
    contra: str

#Modelo para regresar como respuesta
class LoginResponse(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    correo: EmailStr

    model_config = { "from_attributes" : True   }

class ChangePassword(BaseModel):
    correo: EmailStr
    password: str
    confirm_pswd: str
