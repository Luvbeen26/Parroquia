from fastapi import Depends,HTTPException,Header
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from .security import validate_token

security_scheme = HTTPBearer()  # crea esquema Bearer

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token=credentials.credentials #credentials.credentiasl contiene el token
    data=validate_token(token)
    return data