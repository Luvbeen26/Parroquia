from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from utils.database import Base

class Documento(Base):
    __tablename__ = 'documento'
    id_documento = Column(Integer, primary_key=True,index=True)
    id_evento =Column(Integer, ForeignKey("evento.id_evento"),nullable=False)
    id_tipo_documento=Column(String,ForeignKey("tipo_documento.id_tipo_documento"),nullable=False)
    id_evento_participante = Column(Integer, ForeignKey("evento_participante.id_evento_participante"), nullable=True)
    id_celebrado = Column(Integer, ForeignKey("celebrado.id_celebrado"), nullable=True)
    status=Column(String,nullable=False)
    ruta=Column(String, nullable=False)
    motivo_rechazo = Column(String, nullable=False)

    #FK DE LA TABLA
    evento_documento=relationship("Evento",back_populates="documentos")
    tipo_documento=relationship("TipoDocumento",back_populates="documento")
    participante = relationship("EventoParticipante", back_populates="documentos")
    celebrado = relationship("Celebrado", back_populates="documentos")
