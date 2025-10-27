import datetime

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float, Date, DECIMAL, DateTime
from sqlalchemy.orm import relationship
from utils.database import Base


class Comprobante(Base):
    __tablename__ = "comprobantes"

    id_comprobante = Column(Integer, primary_key=True, autoincrement=True)
    folio_comprobante = Column(String(20), unique=True, nullable=False)
    id_evento = Column(Integer, ForeignKey("evento.id_evento"), nullable=False)
    monto = Column(DECIMAL(10,2), nullable=False)
    fecha_pago = Column(DateTime, default=datetime.datetime.utcnow)
    ruta_pdf = Column(String(255), nullable=False)

    evento = relationship("Evento", back_populates="comprobantes")
