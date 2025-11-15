from pydantic import EmailStr
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BD_URL:str
    SMTP_HOST:str
    SMTP_EMAIL:EmailStr
    SMTP_PASSWORD:str
    JWT_ACCESS_KEY:str
    JWT_REFRESH_KEY:str
    GEMINI_KEY:str


    class Config:
        env_file=".env"

settings=Settings()