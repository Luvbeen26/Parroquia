from schema import users as schema_users
from models import codigo_verificacion,users as models_users
import random
from services import email
from sqlalchemy.orm import Session
from utils.database import get_db
from jwt import decode, exceptions
from fastapi import APIRouter,Depends, HTTPException,Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import utils.security as security
from config.setting import settings
import bcrypt
from utils.dependencies import current_user
from utils.security import write_access_token

router=APIRouter(prefix="/auth", tags=["authentication"])

bearer_scheme = HTTPBearer()

@router.post("/create_user")
def create_user(user:schema_users.RegisterUser,db:Session = Depends(get_db)):
    db_user=security.check_email(db,correo=user.correo)

    #Validacion de existencia de correo
    if db_user:
        raise HTTPException(status_code=400, detail="Correo ya Existente")
    db_code=security.check_code(db,code=user.code,correo=user.correo)

    #validacion de contraseña
    if user.contra != user.confirm_pswd:
        raise HTTPException(status_code=400,detail="Las Contraseñas no coinciden")

    #validacion de codigo
    if not db_code:
        raise HTTPException(status_code=400, detail="Codigo no valido (incorrecto o expirado)")


    pswd = bcrypt.hashpw(user.contra.encode(), bcrypt.gensalt(rounds=12))
    db_user= models_users.User(nombres=user.nombres,apellidos=user.apellidos,correo=user.correo,contrasena=pswd)
    db.add(db_user) #guarda el objeto
    db.commit() #Confirma el usar el objeto
    db.refresh(db_user) #refrescar bd para incluir objeto añadido



    token_data={
        "id_usuario": db_user.id_usuario,
        "correo": db_user.correo,
        "es_admin": db_user.es_admin
    }
    print(token_data)

    access_token=security.write_access_token(token_data)
    refresh_token=security.write_refresh_token(token_data)

    return { "access_token" : access_token, "refresh_token" : refresh_token}




@router.post("/send_code")
async def send_code_verification(user:schema_users.Get_email,db:Session = Depends(get_db)):
    codigo=str(random.randint(100000,999999))
    codigo_hash=bcrypt.hashpw(codigo.encode(),bcrypt.gensalt(rounds=12))


    try:
        db_code = codigo_verificacion.CodigoVerificacion(correo=user.correo, codigo_hash=codigo_hash)
        db.add(db_code)
        db.commit()
        db.refresh(db_code)
        await email.send_email(codigo,user.correo,"Codigo de verificacion de creacion de cuenta")
        return {
            "success": True,
            "message" : "Codigo Enviado Correctamente"
         #   "codigo_estructura": db_code,
        #    "codigo": codigo
        }
    except Exception as e:
        return {
            "mensaje" : str(e)
        }





@router.post("/login")
def login_user(user:schema_users.LoginUser,db:Session = Depends(get_db)):
    db_user=security.check_email(db,correo=user.correo)
    if not db_user:
        raise HTTPException(status_code=400, detail="Correo no Existente")

    if not bcrypt.checkpw(user.contra.encode(), db_user.contrasena.encode()):
        raise HTTPException(status_code=400,detail="La contraseña no coinciden")

    token_data={
        "id_usuario": db_user.id_usuario,
        "correo": db_user.correo,
        "es_admin": db_user.es_admin
    }

    access_token=security.write_access_token(token_data)
    refresh_token=security.write_refresh_token(token_data)

    return { "access_token" : access_token, "refresh_token" : refresh_token}




@router.put("/restore_password")
def restore_password(user:schema_users.ChangePassword,db:Session = Depends(get_db)):
    db_user = security.check_email(db, correo=user.correo)
    if not db_user:
        raise HTTPException(status_code=400, detail="Correo no Existente")

    db_code = security.check_code(db, code=user.code, correo=user.correo)

    if not db_code:
        raise HTTPException(status_code=400, detail="Codigo no valido (incorrecto o expirado)")

    hashed_password=bcrypt.hashpw(user.contra.encode(),bcrypt.gensalt(rounds=12))
    #db_user.correo=user.correo
    db_user.contrasena=hashed_password
    db.commit()  # Confirma el usar el objeto
    db.refresh(db_user)  # refrescar bd para incluir objeto añadido
    return db_user


@router.post("/verify_token")
def verify_token(credentials:HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials  # aquí ya tienes solo el JWT
    return security.validate_token(token, output=True)


@router.post("/refresh")
def refresh_token(token:str):
    refresh_key = settings.JWT_REFRESH_KEY

    try:
        data=decode(token,key=refresh_key,algorithms=["HS256"])
    except exceptions.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expirado")
    except exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    new_access_token=write_access_token({"id_usuario" : data["id_usuario"],"correo" : data["correo"], "es_admin" : data["es_admin"]})
    return {"access_token" : new_access_token}