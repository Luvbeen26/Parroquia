from pydantic import BaseModel, EmailStr
from typing import Optional

class ParticipanModel (BaseModel):
    Nklombres: str
    Apellido: str
