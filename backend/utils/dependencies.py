from fastapi import Depends,HTTPException,Header
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from .security import validate_token

security_scheme = HTTPBearer()  # crea esquema Bearer

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token=credentials.credentials #credentials.credentiasl contiene el token
    data=validate_token(token)
    return data

def admin_required(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials  # credentials.credentiasl contiene el token
    data = validate_token(token)

    if not data["es_admin"]:
        raise HTTPException(status_code=403,detail="You are not authorized to access this resource")

    return data