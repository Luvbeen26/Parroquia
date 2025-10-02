from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    es_admin: Optional[int] = 0

class RegisterUser(UserBase):
    contra: str
    confirm_pswd: str

class LoginUser(BaseModel):
    correo: EmailStr
    contra: str

class ChangePassword(BaseModel):
    correo: EmailStr
    password: str
    confirm_pswd: str
