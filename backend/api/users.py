from sqlalchemy.orm import Session
from schema import users as schema_users
from models import users as models_users
import bcrypt
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException

router=APIRouter(prefix="/users", tags=["users"])

@router.post("/create_user")
def create_user(user:schema_users.RegisterUser,db:Session = Depends(get_db)):
    if user.contra != user.confirm_pswd:
        raise HTTPException(status_code=401,detail="Las Contraseñas no coinciden")

    pswd = bcrypt.hashpw(user.contra.encode(), bcrypt.gensalt(rounds=12))
    db_user= models_users.User(nombres=user.nombres,apellidos=user.apellidos,correo=user.correo,contrasena=pswd)
    db.add(db_user) #guarda el objeto
    db.commit() #Confirma el usar el objeto
    db.refresh(db_user) #refrescar bd para incluir objeto añadido
    return db_user

