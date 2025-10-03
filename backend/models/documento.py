from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Documento(Base):
    __tablename__ = 'documento'
    id_documento = Column(Integer, primary_key=True,index=True)
    id_evento =Column(Integer, ForeignKey("evento.id_evento"),nullable=False)
    id_tipo_documento=Column(String,ForeignKey("tipo_documento.id_tipo_documento"),nullable=False)
    status=Column(String,nullable=False)
    ruta=Column(String, nullable=False)
    motivo_rechazo = Column(String, nullable=False)

    #FK DE LA TABLA
    evento_documento=relationship("Evento",back_populates="documentos")
    tipo_documento=relationship("TipoDocumento",back_populates="documento")