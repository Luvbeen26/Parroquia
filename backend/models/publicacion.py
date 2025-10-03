from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Publicacion(Base):
    __tablename__ = 'publicacion'
    id_publicacion = Column(Integer, primary_key=True,index=True)
    id_usuario = Column(String, ForeignKey("usuario.id_usuario"),nullable=False)
    contenido=Column(Float, nullable=False)
    img_ruta=Column(String)
    fecha_hora=Column(DATETIME, nullable=False)
    programado=Column(Boolean,default=False)
    fecha_programado=Column(DATETIME)

    # FK DE LA TABLA
    usuario_publica=relationship("User",back_populates="publicacion")