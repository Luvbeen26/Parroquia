from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy.orm import declarative_base, relationship
from utils.database import Base


class Notificacion(Base):
    __tablename__ = "notificacion"

    idnotificacion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    mensaje = Column(String(100), nullable=False)
    fecha = Column(DATETIME, nullable=False)
    leido = Column(Boolean, default=False)
    tipo = Column(String(45), nullable=True)

    usuario = relationship("User", back_populates="notificaciones")
