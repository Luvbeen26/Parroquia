from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from utils.database import Base

class User(Base):
    __tablename__ = 'usuario'
    id_usuario = Column(Integer, primary_key=True,index=True)
    nombres=Column(String(45), nullable=False)
    apellidos=Column(String(45), nullable=False)
    correo = Column(String(100),unique=True,nullable=False,index=True)
    contrasena=Column(String(20),unique=True,nullable=False)
    es_admin=Column(Boolean,default=False)
