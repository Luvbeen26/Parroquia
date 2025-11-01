from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session
from utils.database import get_db
from models.notificacion import Notificacion
from fastapi import APIRouter,Depends, HTTPException
from utils.dependencies import current_user




router=APIRouter(prefix="/notification", tags=["notification"])

#@router.post("/send_notification")
def send_notification(id_user:int,msg:str,fecha:str,type:str,db:Session):
    try:
        notif=Notificacion(id_usuario=id_user,mensaje=msg,fecha=fecha,leido=False,tipo=type)
        db.add(notif)

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/get_notifications")
def get_notifications(db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    notif=[]
    user_id=user_data["id_usuario"]
    #local_tz=ZoneInfo("America/Tijuana")
    notificaciones=(db.query(Notificacion).filter(Notificacion.id_usuario==user_id)
    .order_by(Notificacion.idnotificacion.desc()).limit(20).all())
    for n in notificaciones:
     #   local_time = n.fecha.astimezone(local_tz)
        notif.append({
            "id" : n.idnotificacion,
            "mensaje" : n.mensaje,
            "fecha": n.fecha,
            #"fecha" : local_time.strftime("%d/%m/%Y"),
            "leido" : n.leido,
            "tipo" : n.tipo,
        })
    return notif

