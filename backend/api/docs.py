import os
import shutil

from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from models.documento import Documento
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from utils.dependencies import current_user, admin_required

router=APIRouter(prefix="/docs", tags=["docs"])


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
        db.query(Documento).filter(Documento.id_documento == id_documento).update(
            {"status": "Rechazado","motivo_rechazo": motivo})
        db.commit()
        return {"msg" : "El documento a sido rechazado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/accept_file")
def accept_file(id_documento:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        db.query(Documento).filter(Documento.id_documento == id_documento).update(
            {"status": "Aceptado","motivo_rechazo": None})
        db.commit()
        return {"msg" : "El documento a sido aceptado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.put("/re-update_file")
def update_file(id_docs: str = Form(...),
                id_evento: int = Form(...),
                files: List[UploadFile] = File(...),db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        id_docs = [int(x) for x in id_docs.split(",")]
        cont=0
        for file in files:
            file_path = os.path.join("Documents", str(id_evento), file.filename)  # combina rutas
            with open(file_path, "wb") as f:  # crea un archivo nuevo
                shutil.copyfileobj(file.file, f)  # copia el contenido del archivo original al nuevo

            db.query(Documento).filter(Documento.id_documento == id_docs[cont]).update({"ruta":file_path,"status":"Pendiente","motivo_rechazo": None})
            cont += 1
        db.commit()
        return {"msg" : "Documentos resubidos"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/get_evidence")
async def get_evidence(id_evento: int,admin_data:dict=Depends(admin_required)):
    folder_path = os.path.join("Images","realized",str(id_evento))

    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Carpeta no encontrada")


    files = [f for f in os.listdir(folder_path) #lista los archivo/carpetas dentro de una direccion
             if os.path.isfile(os.path.join(folder_path, f))] #os.path.isfile si es archivo
    if not files:                                              #Establece la direccion completa de cada archivo
        raise HTTPException(status_code=404, detail="No hay archivos en esta carpeta")

    #Agarra el unico archivo
    filename = files[0]
    file_path = os.path.join(folder_path, filename)


    return FileResponse(path=file_path, media_type="image/jpeg", filename=filename)