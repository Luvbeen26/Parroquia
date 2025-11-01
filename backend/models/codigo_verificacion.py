from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, column, Float, DATETIME, Nullable
from utils.database import Base

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

class CodigoVerificacion(Base):
    __tablename__ = 'codigo_verificacion'
    id_codigo_verificacion=Column(Integer, primary_key=True)
    correo = Column(String, nullable=False)
    codigo_hash= Column(String,nullable=False)
    creado_en = Column(DATETIME, default=lambda: datetime.now(MAZATLAN_TZ))
    expira_en = Column(DATETIME, default=lambda: datetime.now(MAZATLAN_TZ) + timedelta(minutes=15))
    usado=Column(Boolean, default=False)
    #AGREGAR PROPOSITO??