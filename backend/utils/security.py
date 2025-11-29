from zoneinfo import ZoneInfo

from fastapi import HTTPException

from schema import users as schema_users
from sqlalchemy.orm import Session
import jwt
from datetime import datetime,timedelta
from fastapi.responses import JSONResponse
from models import codigo_verificacion,users as models_users
from datetime import datetime, timedelta, timezone
from config.setting import settings
import bcrypt

access_key=settings.JWT_ACCESS_KEY
refresh_key=settings.JWT_REFRESH_KEY

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")


def check_email(db:Session, correo:str):
    return db.query(models_users.User).filter(models_users.User.correo == correo).first()



def check_code(db:Session,code:str,correo:str):
    last_code=db.query(codigo_verificacion.CodigoVerificacion)\
    .filter((codigo_verificacion.CodigoVerificacion.correo == correo) & (codigo_verificacion.CodigoVerificacion.usado == False))\
    .order_by(codigo_verificacion.CodigoVerificacion.creado_en.desc()).first()

    now_mazatlan = datetime.now(MAZATLAN_TZ)
    now = now_mazatlan.replace(tzinfo=None)

    try:
        vigente = last_code.expira_en > now
        codigo_hash = last_code.codigo_hash
        if isinstance(codigo_hash, str):
            codigo_hash = codigo_hash.encode()

        valido = bcrypt.checkpw(code.encode(), codigo_hash)
        print(valido)
        if vigente and valido:
            last_code.usado=True
            db.commit()
            return True
        else:
            print("No se encontró código")
            return False
    except Exception as e:


        print(e)
        return False


def check_password(db:Session, password:str, id:int):
    user=db.query(models_users.User).filter(models_users.User.id_usuario == id).first()
    isSame=bcrypt.checkpw(password.encode(),user.contrasena.encode())
    return isSame



def expire_minutes(minutes : int):
    now=datetime.utcnow()
    new_date=now+timedelta(minutes=minutes)
    return new_date

def write_access_token(data:dict):
    token=jwt.encode(payload={**data,"exp" : expire_minutes(1440) }, key=access_key,algorithm="HS256")
    return token

def write_refresh_token(data:dict):
    token=jwt.encode(payload={**data,"exp":expire_minutes(10080)},key=refresh_key)
    return token

def validate_token(token,output=False):
    try:
        jwt.decode(token,key=access_key,algorithms=["HS256"])
        return jwt.decode(token, key=access_key, algorithms=["HS256"])
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.exceptions.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")

