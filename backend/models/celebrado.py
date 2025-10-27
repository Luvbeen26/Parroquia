from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,Date
from sqlalchemy.orm import relationship
from utils.database import Base

class Celebrado(Base):
    __tablename__ = "celebrado"
    id_celebrado = Column(Integer, primary_key=True, index=True)
    id_evento = Column(Integer, ForeignKey("evento.id_evento"), nullable=False)
    nombres = Column(String(100), nullable=False)
    apellido_pat = Column(String(100), nullable=False)
    apellido_mat = Column(String(100), nullable=False)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    genero = Column(String(1), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    edad = Column(Integer, nullable=False)

    # Relaciones
    rol=relationship("Rol",back_populates="rol_celebrado")
    evento = relationship("Evento", back_populates="celebrados")
    documentos = relationship("Documento", back_populates="celebrado", cascade="all, delete-orphan")
