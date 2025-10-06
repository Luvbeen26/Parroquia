from sqlalchemy.orm import Session
from schema import users as schema_users
from models import codigo_verificacion,users as models_users
from crud import users as crud_users
import random
import bcrypt
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException
from services import email



router=APIRouter(prefix="/users", tags=["users"])



#FALTA
#INUTILIZAR LOS DEMAS
@router.post("/create_user")
def create_user(user:schema_users.RegisterUser,db:Session = Depends(get_db)):
    db_user=crud_users.check_email(db,correo=user.correo)
    #Validacion de existencia de correo
    if db_user:
        raise HTTPException(status_code=400, detail="Correo ya Existente")

    db_code=crud_users.check_code(db,code=user.code,correo=user.correo)

    #validacion de contraseña
    if user.contra != user.confirm_pswd:
        raise HTTPException(status_code=401,detail="Las Contraseñas no coinciden")

    #validacion de codigo
    if not db_code:
        raise HTTPException(status_code=400, detail="Codigo no valido (incorrecto o expirado)")



    pswd = bcrypt.hashpw(user.contra.encode(), bcrypt.gensalt(rounds=12))
    db_user= models_users.User(nombres=user.nombres,apellidos=user.apellidos,correo=user.correo,contrasena=pswd)
    db.add(db_user) #guarda el objeto
    db.commit() #Confirma el usar el objeto
    db.refresh(db_user) #refrescar bd para incluir objeto añadido
    return db_user



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
            "codigo_estructura": db_code,
            "codigo": codigo
        }
    except Exception as e:
        return {
            "mensaje" : str(e)
        }





@router.post("/login", response_model=schema_users.LoginResponse)
def login_user(user:schema_users.LoginUser,db:Session = Depends(get_db)):
    db_user=crud_users.check_email(db,correo=user.correo)
    if not db_user:
        raise HTTPException(status_code=400, detail="Correo no Existente")

    if not bcrypt.checkpw(user.contra.encode(), db_user.contrasena.encode()):
        raise HTTPException(status_code=400,detail="La contraseña no coinciden")

    return db_user




@router.put("/restore_password")
def restore_password(user:schema_users.ChangePassword,db:Session = Depends(get_db)):
    db_user = crud_users.check_email(db, correo=user.correo)
    if not db_user:
        raise HTTPException(status_code=400, detail="Correo no Existente")

    db_code = crud_users.check_code(db, code=user.code, correo=user.correo)

    if not db_code:
        raise HTTPException(status_code=400, detail="Codigo no valido (incorrecto o expirado)")

    hashed_password=bcrypt.hashpw(user.contra.encode(),bcrypt.gensalt(rounds=12))
    #db_user.correo=user.correo
    db_user.contrasena=hashed_password
    db.commit()  # Confirma el usar el objeto
    db.refresh(db_user)  # refrescar bd para incluir objeto añadido
    return db_user

#jijodesuputamadre04@gmail.com