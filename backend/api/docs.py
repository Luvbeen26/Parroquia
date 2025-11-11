import datetime
import os
import shutil
from zoneinfo import ZoneInfo

from sqlalchemy import func, cast, and_
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from models.documento import Documento
from models.evento import Evento
from utils.database import get_db
from .notif import send_notification
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from utils.dependencies import current_user, admin_required

router=APIRouter(prefix="/docs", tags=["docs"])

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

@router.get("/show/rejected/{id}")
def show_rejectdocs(id:int,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        rejectFiles=db.query(Documento).filter(and_(Documento.id_evento == id,Documento.status=="Rechazado"))



        result=[]
        for i in rejectFiles:
            if i.evento_documento.id_usuario != user_data["id_usuario"]:
                raise HTTPException(status_code=401, detail="Usuario no coincide")



            result.append({
                "id_documento":i.id_documento,
                "descripcion": f"{i.tipo_documento.descripcion} {i.participante.rol.descripcion if i.participante else ''}",
                "motivo":i.motivo_rechazo
            })

        return result
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/show/pendient")
def show_pendientdocs(db:Session = Depends(get_db)):
    try:
        cantidad=db.query(func.count(Documento.id_evento)).filter(Documento.status == "Pendiente").scalar()
        cantidad=cantidad or 0
        return cantidad
    except Exception as error:
        print(error)




@router.post("/upload_file")
async def upload_file(tipos_docs: str = Form(...),
                    id_evento: int = Form(...),
                    id_participante: Optional[str] = Form(None),
                    id_celebrado: Optional[str] = Form(None),
                    files: List[UploadFile] = File(...),db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    #LOS DATOS DE PASARAN EN EL FRONT(listado de documentos(id),id_participantes(aunque son el puro padrino),id_celebrado)
    #Se va tener que modificar esta parte

    #DEJAR DE ULTIMO A LOS PADRINOS
    try:
        tipos_docs = [int(x) for x in tipos_docs.split(",")]
        id_participante = [int(x) for x in id_participante.split(",")] if id_participante else []
        id_celebrado = [int(x) for x in id_celebrado.split(",")] if id_celebrado else []

        #Crea las carpetas necesarias para la direccion si no existen
        os.makedirs(f"Documents/{id_evento}", exist_ok=True)
        cont=0
        paths=[]
        for file in files:

            file_path=os.path.join("Documents",str(id_evento),file.filename) #combina rutas
            with open(file_path,"wb") as f: #crea un archivo nuevo
                shutil.copyfileobj(file.file, f) #copia el contenido del archivo original al nuevo

                if id_evento == 5: #XV
                    id_cel=id_celebrado[0]
                    id_part=None

                elif id_evento == 4:
                    if cont < 5:
                        id_cel = id_celebrado[0]  # novio
                        id_part = None
                    elif cont < 10:
                        id_cel = id_celebrado[1] #novia
                        id_part = None
                    else:
                        id_cel = None #padrinos
                        id_part = id_participante[cont-10]
                else:
                    if cont==0:
                        id_cel = id_celebrado[0]
                        id_part = None
                    else:
                        id_cel = None
                        id_part = id_participante[0]
            archivo = Documento(id_evento=id_evento, id_tipo_documento=tipos_docs[cont],
                                id_evento_participante=id_part,id_celebrado=id_cel, status="Pendiente", ruta=file_path)
            db.add(archivo)
            paths.append(file_path)
            cont+=1
        db.commit()
        return {"msg": "guardados", "paths": paths}

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/reject_file")
def reject_file(id_documento:int,motivo:str,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        documento = db.query(Documento).filter(Documento.id_documento == id_documento).first()
        if not documento:
            raise HTTPException(status_code=404, detail="Documento no encontrado")

        documento.status="Rechazado"
        documento.motivo_rechazo=motivo

        usuario_id=documento.evento_documento.id_usuario
        if documento.id_evento_participante:
            rol=documento.participante.rol.descripcion
        elif documento.id_celebrado:
            rol=documento.celebrado.rol.descripcion
        tipo_documento=documento.tipo_documento.descripcion +' ' +rol

        send_notification(usuario_id,f"El documento {tipo_documento} a sido rechazado",datetime.datetime.now(MAZATLAN_TZ),"D",db)

        db.commit()
        return {"msg" : "El documento a sido rechazado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/accept_file")
def accept_file(id_documento:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        documento = db.query(Documento).filter(Documento.id_documento == id_documento).first()
        if not documento:
            raise HTTPException(status_code=404, detail="Documento no encontrado")

        documento.status = "Aceptado"
        documento.motivo_rechazo = None

        usuario_id = documento.evento_documento.id_usuario
        if documento.id_evento_participante:
            rol = documento.participante.rol.descripcion
        elif documento.id_celebrado:
            rol = documento.celebrado.rol.descripcion
        tipo_documento = documento.tipo_documento.descripcion + ' ' + rol

        send_notification(usuario_id, f"El documento {tipo_documento} a sido aceptado", datetime.datetime.now(MAZATLAN_TZ),
                          "D", db)

        db.commit()
        return {"msg": "El documento a sido aceptado"}

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))





@router.put("/re_update_file")
def update_file(id_docs: str = Form(...),
                files: List[UploadFile] = File(...),db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        print("entrando")
        id_docs = [int(x) for x in id_docs.split(",")]
        cont=0
        print("entrando2")
        for file in files:
            documento = db.query(Documento).filter(Documento.id_documento == id_docs[cont]).first()

            file_path = os.path.join("Documents", str(documento.id_evento), file.filename)  # combina rutas
            print("entrando3")
            if documento.ruta and os.path.exists(documento.ruta):
                os.remove(documento.ruta)
            print(file_path)
            print("entrando4")
            with open(file_path, "wb") as f:  # crea un archivo nuevo
                shutil.copyfileobj(file.file, f)  # copia el contenido del archivo original al nuevo

            documento.ruta = file_path
            documento.status = "Pendiente"
            documento.motivo_rechazo = None

            cont += 1
        db.commit()
        return {"msg" : "Documentos resubidos"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/get_evidence")
async def get_evidence(id_evento: int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    #folder_path = os.path.join("Images","realized",str(id_evento))
    evento = db.query(Evento).filter(Evento.id_evento == id_evento).first()

    if not evento:
        raise HTTPException(status_code=404, detail="El evento no existe")

    file_path=evento.evidencia

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="El archivo no existe")

    filename=os.path.basename(file_path)

    return FileResponse(path=file_path, media_type="image/jpeg", filename=filename)