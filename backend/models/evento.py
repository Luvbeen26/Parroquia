from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Evento(Base):
    __tablename__ = 'evento'
    id_evento = Column(Integer, primary_key=True,index=True)
    id_usuario =Column(Integer,ForeignKey("usuario.id_usuario") ,nullable=False)
    folio=Column(String,nullable=False)
    fecha_hora_inicio = Column(DATETIME, nullable=False)
    status=Column(String,nullable=False)
    id_tipo_evento=Column(Integer, ForeignKey("tipo_evento.id_tipo_evento"), nullable=False)
    descripcion=Column(String,nullable=False)
    fecha_hora_fin= Column(DATETIME, nullable=False)
    evidencia=Column(String, nullable=False)
    # FK DE LA TABLA
    usuario_evento=relationship("User",back_populates="evento")
    tipo_evento=relationship("TipoEvento",back_populates="evento")

    ##
    documentos=relationship("Documento",back_populates="evento_documento")
    evento_participante=relationship("EventoParticipante",back_populates="evento")
    celebrados = relationship("Celebrado", back_populates="evento", cascade="all, delete-orphan")
    comprobantes=relationship("Comprobante",back_populates="evento")