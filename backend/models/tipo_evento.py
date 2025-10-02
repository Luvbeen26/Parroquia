from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class TipoEvento(Base):
    __tablename__ = 'tipo_evento'
    id_tipo_evento = Column(Integer, primary_key=True,index=True)
    descripcion = Column(String, nullable=False)
    costo_impresion=Column(Float, nullable=False)
    costo_programar=Column(Float, nullable=False)
