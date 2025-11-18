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
    id_categoria = Column(Integer, ForeignKey("categoria_pg.id_categoria_pg"), nullable=False)
    # FK DE LA TABLA
    pago = relationship("Categoria", back_populates="categoria_pago")
    usuario_pagos=relationship("User",back_populates="pagos")
