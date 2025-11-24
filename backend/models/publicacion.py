from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship

from utils.database import Base

class Publicacion(Base):
    __tablename__ = 'publicacion'
    id_publicacion = Column(Integer, primary_key=True,index=True)
    id_usuario = Column(String, ForeignKey("usuario.id_usuario"),nullable=False)
    titulo = Column(String, nullable=False)
    contenido=Column(String, nullable=True)
    fecha_hora=Column(DATETIME, nullable=False)


    # FK DE LA TABLA
    usuario_publica=relationship("User",back_populates="publicacion")
    imagenes = relationship("ImagenPublicacion", back_populates="publicacion", cascade="all, delete-orphan")
