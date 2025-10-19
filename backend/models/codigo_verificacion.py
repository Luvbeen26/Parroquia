from datetime import datetime, timedelta
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float, DATETIME, Nullable
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class CodigoVerificacion(Base):
    __tablename__ = 'codigo_verificacion'
    id_codigo_verificacion=Column(Integer, primary_key=True)
    correo = Column(String, nullable=False)
    codigo_hash= Column(String,nullable=False)
    creado_en= Column(DATETIME,default=datetime.utcnow)
    expira_en= Column(DATETIME,default=lambda: datetime.utcnow() + timedelta(minutes=15))
    usado=Column(Boolean, default=False)
    #AGREGAR PROPOSITO??