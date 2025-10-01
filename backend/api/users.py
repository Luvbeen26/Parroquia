from fastapi import APIRouter,Depends, HTTPException
import bcrypt

router=APIRouter(prefix="/users", tags=["users"])
@router.post("/create_user")

def Create_user(user_post: UserRegister):
    # for i in usuarios:
    #    if i.correo == user_post.correo:
    #       raise HTTPException(status_code=404,detail="usuario duplicado")

    # if user_post.contra!=user_post.confirm_pswd:
    #   raise HTTPException(status_code=404,detail="La contraseña no coincide")

    user_post.contra = hashing(user_post.contra)
    usuarios.append(user_post)
    return {'user': user_post}