from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float, DATETIME, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class ImagenPublicacion(Base):
    __tablename__ = "imagenes_publicacion"

    id_imagen = Column(Integer, primary_key=True, index=True)
    id_publicacion = Column(Integer, ForeignKey("publicacion.id_publicacion", ondelete="CASCADE"), nullable=False)
    ruta = Column(String(255), nullable=False)


    publicacion = relationship("Publicacion", back_populates="imagenes")
