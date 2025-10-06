from sqlalchemy.orm import Session
from schema import users as schema_users
from models import codigo_verificacion,users as models_users
from datetime import datetime, timedelta, timezone

import bcrypt

def check_email(db:Session, correo:str):
    return db.query(models_users.User).filter(models_users.User.correo == correo).first()



def check_code(db:Session,code:str,correo:str):
    last_code=db.query(codigo_verificacion.CodigoVerificacion)\
    .filter((codigo_verificacion.CodigoVerificacion.correo == correo) & (codigo_verificacion.CodigoVerificacion.usado == False))\
    .order_by(codigo_verificacion.CodigoVerificacion.creado_en.desc()).first()

    now=datetime.utcnow()
    try:
        vigente = last_code.expira_en > now
        valido=bcrypt.checkpw(code.encode(), last_code.codigo_hash.encode())

        if vigente and valido:
            last_code.usado=True
            db.commit()
            return True
        else:
            return False
    except Exception as e:
        print(e)
        return False




