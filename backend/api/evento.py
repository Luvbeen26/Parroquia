import os
import shutil
from sqlalchemy.orm import Session
import datetime

import schema.evento
from models.celebrado import Celebrado
from schema import evento as schema_event
from models import evento as models_event
from models import evento_participantes as event_part
from models.documento import Documento
from models.pagos import Pagos
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from utils.dependencies import current_user
import utils.security as security


router=APIRouter(prefix="/event", tags=["event"])

@router.post("/Bautizo")
def create_bautizo(id_tipo_evento:int = 1 | 2,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    create_event(id_tipo_evento,user_data)

@router.post("/create_event")
def create_event(id_tipo_evento:int,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    fecha=datetime.datetime.utcnow() #Modificar al momento en el que se haga en el front

    id_tipo_evento=1

    user_id=user_data["id_usuario"]
    folio=get_last_folio(db)
    event=models_event.Evento(id_usuario=user_id,folio=folio,fecha_hora=fecha,status="P",id_tipo_evento=id_tipo_evento)

    try:
        db.add(event)
        db.commit()
        db.refresh(event)
        return {"msg": f"Evento creado correctamente {id_tipo_evento}","id_evento" : event.id_evento}
    except Exception as error:
        raise HTTPException(status_code=444, detail=str(error))

@router.post("/celebrate_event")
def register_celebrated(celebrated:schema_event.CelebratedModel,db:Session = Depends(get_db)):
    try:
        celebrado = Celebrado(id_evento=celebrated.id_evento, nombres=celebrated.nombres,
                            apellido_pat=celebrated.apellido_pat, apellido_mat=celebrated.apellido_mat,
                            id_rol=celebrated.id_rol,genero=celebrated.genero,fecha_nacimiento=celebrated.fecha_nac,edad=celebrated.edad)
        db.add(celebrado)
        db.commit()
        db.refresh(celebrado)
        return {"msg": "celebrado registrado", "celebrado": celebrated}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/participant_event")
def register_participant(participant:schema_event.ParticipantModel,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        participante=event_part.EventoParticipante(id_evento=participant.id_evento,nombres=participant.nombres,apellido_pat=participant.apellido_pat,apellido_mat=participant.apellido_mat,id_rol=participant.id_rol)
        db.add(participante)
        db.commit()
        db.refresh(participante)
        return {"msg" : "participante registrado", "participante" : participante}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/upload_file")
async def upload_file(tipos_docs: str = Form(...),
                    id_evento: int = Form(...),
                    id_participante: Optional[str] = Form(None),
                    id_celebrado: Optional[str] = Form(None),
                      files: List[UploadFile] = File(...),db:Session = Depends(get_db)):
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
                        id_part = id_participante[cont-4]
                else:
                    if cont==0:
                        id_cel = id_celebrado[0]
                        id_part = None
                    else:
                        id_cel = None
                        id_part = id_participante[-1]
            archivo = Documento(id_evento=id_evento, id_tipo_documento=tipos_docs[cont],
                                id_evento_participante=id_part,id_celebrado=id_cel, status="Pendiente", ruta=file_path)
            db.add(archivo)
            paths.append(file_path)
            cont+=1
        db.commit()
        return {"msg": "guardados", "paths": paths}

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.post("/pay_state")
def metodo_pago(pago:schema.evento.Pago,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        user_id=user_data["id_usuario"]
        pay=Pagos(fecha_hora=datetime.datetime.utcnow(),monto=pago.monto,id_usuario=user_id,descripcion=pago.descripcion)
        db.add(pay)
        db.commit()
        db.refresh(pay)
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


def get_last_folio(db:Session):
    last=db.query(models_event).order_by(models_event.folio.desc()).first()
    if not last:
        return "0000001"
    new_folio=int(last.folio) + 1
    return f"{new_folio:08d}"
