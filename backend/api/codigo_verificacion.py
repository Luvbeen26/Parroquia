from sqlalchemy.orm import Session
from schema import users as schema_users
from models import codigo_verificacion,users as models_users

from crud import users as crud_users
import bcrypt
from utils.database import get_db
import random
from fastapi import APIRouter,Depends, HTTPException

#router=APIRouter(prefix="/code_verify", tags=["code_verify"])

