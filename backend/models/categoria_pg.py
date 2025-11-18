from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Categoria(Base):
    __tablename__ = 'categoria_pg'
    id_categoria_pg = Column(Integer, primary_key=True,index=True)
    descripcion=Column(String, nullable=False)
    tipo = Column(String, nullable=False)

    # FK DE LA TABLA
    categoria_transacciones=relationship("Transaccion",back_populates="categoria")
    categoria_pago=relationship("Pagos",back_populates="pago")
    categoria_gasto=relationship("Gastos",back_populates="gasto")
#    usuario_gastos=relationship("User",back_populates="gastos")