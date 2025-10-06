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
    code: str

class LoginUser(BaseModel):
    correo: EmailStr
    contra: str

#Modelo para regresar como respuesta
class LoginResponse(UserBase):
    id_usuario: int
    model_config = { "from_attributes" : True }



class ChangePassword(LoginUser):
    code: str



class Get_email(BaseModel):
    correo: EmailStr