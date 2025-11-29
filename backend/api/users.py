from sqlalchemy.orm import Session
from schema import users as schema_users
from models import users as models_users
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException
from utils.dependencies import current_user
from api.auth import validar_password
import utils.security as security
import bcrypt

router=APIRouter(prefix="/users", tags=["users"])


@router.get("/info_user")
def get_into(db: Session = Depends(get_db),user_data:dict=Depends(current_user)):

    try:
        user_id=user_data["id_usuario"]
        print(user_id)
        user=db.query(models_users.User).get(user_id)
        return user
    except Exception as e:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


@router.put("/change_password")
def change_password(password:schema_users.ChangePasswordOnSession,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        db_user=security.check_email(db,correo=user_data["correo"])
        print(password.password)
        print(password.old_password)

        if not db_user:
            raise HTTPException(status_code=404,detail="Usuario no encontrado")

        check=security.check_password(db,password.old_password,user_data["id_usuario"])
        print(check)

        if check is True:
            print(validar_password(password.password))
            if not validar_password(password.password):
                raise HTTPException(status_code=404,detail="Contraseña invalida: 1 Mayuscula, 1 minuscula y de 8-25 caracteres")
            print("a")
            hashed_password = bcrypt.hashpw(password.password.encode(), bcrypt.gensalt(rounds=12))
            db_user.contrasena = hashed_password
            db.commit()  # Confirma el usar el objeto
            db.refresh(db_user)  # refrescar bd para incluir objeto añadido
            return db_user
        else:
            raise HTTPException(status_code=406,detail="Contraseña no coincide")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404,detail="Error al cambiar la contraseña")

@router.put("/change_personal")
def change_personalinfo(personal_info:schema_users.UserBase, db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        db_user=db.query(models_users.User).get(user_data["id_usuario"])
        user_id=user_data["id_usuario"]
        if not db_user:
            raise HTTPException(status_code=406,detail="Usuario no encontrado")

        if not personal_info.nombres or not personal_info.nombres.strip():
            raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")

        if not personal_info.apellidos or not personal_info.apellidos.strip():
            raise HTTPException(status_code=400, detail="Los apellidos no pueden estar vacíos")

        db_user.nombres = personal_info.nombres
        db_user.apellidos = personal_info.apellidos

        db.commit()
        db.refresh(db_user)
        return {"msg" : "Usuario actualizado correctamente", "user" : personal_info}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=404,detail="Usuario no encontrado")