from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Rol(Base):
    __tablename__ = 'rol'
    id_rol = Column(Integer, primary_key=True,index=True)
    descripcion =Column(String,nullable=False)

    ####
    rol_celebrado=relationship("Celebrado",back_populates="rol")
    rol_participante=relationship("EventoParticipante",back_populates="rol")
