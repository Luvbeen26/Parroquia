from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float,DATETIME
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class Gastos(Base):
    __tablename__ = 'gastos'
    id_gasto = Column(Integer, primary_key=True,index=True)
    id_usuario=Column(Integer,ForeignKey("usuario.id_usuario"), nullable=False)
    fecha_hora=Column(DATETIME,nullable=False)
    monto = Column(Float, nullable=False)
    descripcion=Column(String, nullable=False)
    evidencia = Column(String, nullable=False)

    # FK DE LA TABLA
    usuario_gastos=relationship("User",back_populates="gastos")