from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Transaccion(Base):
    __tablename__ = "transacciones"

    id_transaccion = Column(Integer, primary_key=True, autoincrement=True)
    monto = Column(Float, nullable=False)
    fecha = Column(DATETIME, nullable=False)
    id_categoria = Column(Integer, ForeignKey("categoria_pg.id_categoria_pg"), nullable=False)
    descripcion = Column(String(255), nullable=True)
    evidencia = Column(String, nullable=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    # FK a categoria
    categoria = relationship("Categoria", back_populates="categoria_transacciones")