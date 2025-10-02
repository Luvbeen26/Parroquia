from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class TipoDocumento(Base):
    __tablename__ = 'tipo_documento'
    id_tipo_documento = Column(Integer, primary_key=True,index=True)
    descripcion = Column(String, nullable=False)
    