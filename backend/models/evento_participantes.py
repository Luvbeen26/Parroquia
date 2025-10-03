from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class EventoParticipante(Base):
    __tablename__ = 'evento_participante'
    id_evento_participante = Column(Integer, primary_key=True,index=True)
    id_evento =Column(Integer, ForeignKey("evento.id_evento"),nullable=False)
    nombres=Column(String,nullable=False)
    apellido_pat=Column(String,nullable=False)
    apellido_mat = Column(String, nullable=False)
    id_rol=Column(Integer, ForeignKey("rol.id_rol"),nullable=False)

    # FK DE LA TABLA
    evento=relationship("Evento",back_populates="evento_participante")
    rol=relationship("Rol",back_populates="rol_participante")