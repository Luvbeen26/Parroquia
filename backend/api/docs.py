import datetime
import os
import shutil
from zoneinfo import ZoneInfo
import re
import unicodedata
from pathlib import Path
from sqlalchemy import func, cast, and_, String, or_
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from models import EventoParticipante
from models.celebrado import Celebrado
from models.documento import Documento
from models.evento import Evento
from utils.database import get_db
from .notif import send_notification
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form,Request
from typing import List, Optional
from utils.dependencies import current_user, admin_required

router=APIRouter(prefix="/docs", tags=["docs"])

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")


def sanitize_filename(filename: str) -> str:
    name = Path(filename).stem #separa el nombre de la extension
    extension = Path(filename).suffix
    name = unicodedata.normalize('NFKD', name) #Remover espacio
    name = name.encode('ASCII', 'ignore').decode('ASCII') #normaliza
    name = name.replace(' ', '_') #remplaza espacios por _
    name = re.sub(r'[^\w\-]', '', name) #cambia ciertos caracteres
    name = re.sub(r'_+', '_', name) #quita guiones bajos
    name = name.strip('_-') #quita _- al inicio y al final
    name = name.lower() #todo en minuscula

    return f"{name}{extension}"

@router.get("/show/rejected/{id}")
def show_rejectdocs(id:int,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        rejectFiles=db.query(Documento).filter(and_(Documento.id_evento == id,Documento.status=="Rechazado"))

        result=[]
        for i in rejectFiles:
            if i.evento_documento.id_usuario != user_data["id_usuario"]:
                raise HTTPException(status_code=404, detail="Usuario no coincide")



            result.append({
                "id_documento":i.id_documento,
                "descripcion": f"{i.tipo_documento.descripcion} {i.participante.rol.descripcion if i.participante else ''}",
                "motivo":i.motivo_rechazo
            })

        return result
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/upload_file")
async def upload_file(tipos_docs: str = Form(...),id_evento: int = Form(...),id_participante: Optional[str] = Form(None),
                      id_celebrado: Optional[str] = Form(None),files: List[UploadFile] = File(...),
                      db: Session = Depends(get_db),user_data: dict = Depends(current_user)):
    try:
        tipos_docs = [int(x) for x in tipos_docs.split(",")]
        id_participante = [int(x) for x in id_participante.split(",")] if id_participante else []
        id_celebrado = [int(x) for x in id_celebrado.split(",")] if id_celebrado else []


        os.makedirs(f"Documents/{id_evento}", exist_ok=True)
        cont = 0
        paths = []

        for file in files:
            clean_filename = sanitize_filename(file.filename)
            file_path = os.path.join("Documents", str(id_evento), clean_filename)
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
                if id_evento == 5:  # XV
                    id_cel = id_celebrado[0]
                    id_part = None

                elif id_evento == 4:  # Matrimonio
                    if cont < 5:
                        id_cel = id_celebrado[0]  # novio
                        id_part = None
                    elif cont < 10:
                        id_cel = id_celebrado[1]  # novia
                        id_part = None
                    else:
                        id_cel = None  # padrinos
                        id_part = id_participante[cont - 10]
                else:
                    if cont == 0:
                        id_cel = id_celebrado[0]
                        id_part = None
                    else:
                        id_cel = None
                        id_part = id_participante[0]

            archivo = Documento(id_evento=id_evento,id_tipo_documento=tipos_docs[cont],
                id_evento_participante=id_part,id_celebrado=id_cel,status="Pendiente",ruta=file_path)
            db.add(archivo)
            paths.append(file_path)
            cont += 1

        db.commit()
        return {"msg": "guardados", "paths": paths}

    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))

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
                files: List[UploadFile] = File(...),
                db: Session = Depends(get_db),
                user_data: dict = Depends(current_user)):
    try:
        id_docs = [int(x) for x in id_docs.split(",")]
        cont = 0
        updated_paths = []

        for file in files:
            documento = db.query(Documento).filter(
                Documento.id_documento == id_docs[cont]
            ).first()

            if not documento:
                raise HTTPException(
                    status_code=404,
                    detail=f"Documento con id {id_docs[cont]} no encontrado"
                )

            clean_filename = sanitize_filename(file.filename)
            file_path = os.path.join("Documents", str(documento.id_evento), clean_filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            if documento.ruta and os.path.exists(documento.ruta):
                try:
                    os.remove(documento.ruta)
                except Exception as e:
                    raise HTTPException(status_code=404, detail=str(e))


            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)

            documento.ruta = file_path
            documento.status = "Pendiente"
            documento.motivo_rechazo = None

            updated_paths.append(file_path)
            cont += 1

        db.commit()
        return {
            "msg": "Documentos resubidos",
            "updated_files": len(updated_paths),
            "paths": updated_paths
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/show/docs")
def show_Docs(
    status: str,request: Request,db: Session = Depends(get_db),admin_data: dict = Depends(admin_required),
    nombre: Optional[str] = None,tipo: Optional[str] = None):
    try:
        if tipo == "1":
            tipos_validos = ["1", "2"]
        else:
            tipos_validos = [tipo] if tipo is not None else None

        if nombre is not None and tipo is not None:
            docs = (db.query(Documento).outerjoin(Documento.celebrado).outerjoin(Documento.participante).outerjoin(Documento.evento_documento)
                .filter(and_(Documento.status == status,Documento.id_tipo_documento.in_(tipos_validos),or_(
                            Celebrado.nombres.ilike(f"%{nombre}%"),Celebrado.apellido_pat.ilike(f"%{nombre}%"),Celebrado.apellido_mat.ilike(f"%{nombre}%"),
                            EventoParticipante.nombres.ilike(f"%{nombre}%"),EventoParticipante.apellido_pat.ilike(f"%{nombre}%"),EventoParticipante.apellido_mat.ilike(f"%{nombre}%"),
                            (Evento.folio.ilike(f"%{nombre}%"))),)).all())


        elif nombre is not None:
            docs = (db.query(Documento).outerjoin(Documento.celebrado).outerjoin(Documento.participante).outerjoin(Documento.evento_documento)
                .filter(and_(Documento.status == status,or_(Celebrado.nombres.ilike(f"%{nombre}%"),
                            Celebrado.apellido_pat.ilike(f"%{nombre}%"),Celebrado.apellido_mat.ilike(f"%{nombre}%"),
                            EventoParticipante.nombres.ilike(f"%{nombre}%"),EventoParticipante.apellido_pat.ilike(f"%{nombre}%"),
                            EventoParticipante.apellido_mat.ilike(f"%{nombre}%"),Evento.folio.ilike(f"%{nombre}%")),))
                .all())

        elif tipo is not None:
            docs = (db.query(Documento).outerjoin(Documento.celebrado).outerjoin(Documento.participante)
                .filter(and_(Documento.status == status,Documento.id_tipo_documento.in_(tipos_validos),)).all())

        else:
            docs = db.query(Documento).filter(Documento.status == status).all()

        # Construcción del resultado
        base_url = str(request.base_url).rstrip("/")
        result = []

        for d in docs:
            if d.evento_documento.tipo_evento.descripcion in ["Privado","Comunitario"]:
                tipo_evento="Bautizo"
            else:
                tipo_evento=d.evento_documento.tipo_evento.descripcion

            if d.participante:
                rol = d.participante.rol.descripcion
                nombre_completo = f"{d.participante.nombres} {d.participante.apellido_pat} {d.participante.apellido_mat}"
            elif d.celebrado:
                rol = d.celebrado.rol.descripcion
                nombre_completo = f"{d.celebrado.nombres} {d.celebrado.apellido_pat} {d.celebrado.apellido_mat}"
            else:
                rol = ""
                nombre_completo = ""

            tipo_desc = f"{d.tipo_documento.descripcion} {rol}"
            ruta = f"{base_url}/{d.ruta}".replace("\\", "/")

            result.append({
                "id_documento": d.id_documento,
                "evento": tipo_evento,
                "tipo": tipo_desc,
                "participante": nombre_completo,
                "motivo": d.motivo_rechazo,
                "folio" : d.evento_documento.folio,
                "documento": ruta
            })

        return result

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

