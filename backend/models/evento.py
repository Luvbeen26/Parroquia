from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Evento(Base):
    __tablename__ = 'evento'
    id_evento = Column(Integer, primary_key=True,index=True)
    id_usuario =Column(Integer, nullable=False)
    folio=Column(String,nullable=False)
    fecha_hora = Column(DATETIME, nullable=False)
    status=Column(String,nullable=False)
    id_tipo_evento=Column(Integer, nullable=False)