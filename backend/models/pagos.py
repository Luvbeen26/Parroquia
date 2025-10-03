from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Pagos(Base):
    __tablename__ = 'pagos'
    id_pagos = Column(Integer, primary_key=True,index=True)
    fecha_hora=Column(DATETIME, nullable=False)
    monto=Column(Float,nullable=False)
    id_usuario = Column(Integer,ForeignKey("usuario.id_usuario"),nullable=False)
    descripcion=Column(String, nullable=False)

    # FK DE LA TABLA
    usuario_pagos=relationship("User",back_populates="pagos")
