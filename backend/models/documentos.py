from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Documentos(Base):
    __tablename__ = 'documentos'
    id_documento = Column(Integer, primary_key=True,index=True)
    id_evento =Column(Integer, nullable=False)
    id_tipo_documento=Column(String,nullable=False)
    status=Column(String,nullable=False)
    ruta=Column(String, nullable=False)
    motivo_rechazo = Column(String, nullable=False)