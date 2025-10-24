from sqlalchemy.orm import Session
from schema import users as schema_users
from models import users as models_users
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException
from utils.dependencies import current_user
import utils.security as security
import bcrypt

router=APIRouter(prefix="/users", tags=["users"])


@router.put("/change_password")
def change_password(password:schema_users.ChangePasswordOnSession,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    db_user=security.check_email(db,correo=user_data["correo"])

    if not db_user:
        raise HTTPException(status_code=404,detail="User not found")

    check=security.check_password(db,password.old_password,user_data["id_usuario"])

    if check:
        hashed_password = bcrypt.hashpw(password.password.encode(), bcrypt.gensalt(rounds=12))
        db_user.contrasena = hashed_password
        db.commit()  # Confirma el usar el objeto
        db.refresh(db_user)  # refrescar bd para incluir objeto añadido
        return db_user
    else:
        return HTTPException(status_code=406,detail="Contraseña no coincide")


@router.put("/change_personal")
def change_personalinfo(personal_info:schema_users.UserBase, db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    db_user=security.check_email(db,correo=personal_info.correo)

    user_id=user_data["id_usuario"]

    if db_user and db_user.id_usuario != user_id:
        raise HTTPException(status_code=406,detail="Correo no aceptado, ya esta en uso")

    db_user=db.query(models_users.User).filter(models_users.User.id_usuario == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404,detail="User not found")

    db_user.nombres = personal_info.nombres
    db_user.apellidos = personal_info.apellidos
    db_user.correo = personal_info.correo

    db.commit()
    db.refresh(db_user)
    return {"msg" : "Usuario actualizado correctamente", "user" : personal_info}
