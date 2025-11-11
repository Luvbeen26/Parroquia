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

class ChangePassword(LoginUser):
    code: str

class ChangePasswordOnSession(BaseModel):
    password: str
    old_password: str

class Get_email(BaseModel):
    correo: EmailStr


class Refresh(BaseModel):
    refresh_token: str
