from config.setting import settings
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


#URL DE CONEXION
Url_DB = settings.DATABASE_URL

#motor de sqlalchemy
engine = create_engine(Url_DB)

##Declarar una sesion
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#clase base para nuestros modelos
Base = declarative_base()