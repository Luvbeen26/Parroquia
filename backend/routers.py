from fastapi import APIRouter
from api.users import router as user_router
from api.auth import router as auth_router
from api.evento import router as event_router
from api.docs import router as docs_router
from api.notif import router as notif_router
from api.finanzas import router as finanzas_router
from api.publicacion import router as publicacion_router
from api.dashboard import router as dashboard_router
#from api.codigo_verificacion import router as codigo_verificacion_router

api_router = APIRouter()

api_router.include_router(user_router)
api_router.include_router(auth_router)
api_router.include_router(event_router)
api_router.include_router(docs_router)
api_router.include_router(notif_router)
api_router.include_router(finanzas_router)
api_router.include_router(publicacion_router)
api_router.include_router(dashboard_router)
#api_router.include_router(codigo_verificacion_router)
