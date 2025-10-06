from pydantic import BaseModel, EmailStr
from typing import Optional

class EventModel(BaseModel):
    nombre: str
