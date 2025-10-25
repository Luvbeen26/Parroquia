import os
import shutil
from sqlalchemy import and_
from sqlalchemy.orm import Session
import datetime
import schema.evento
from models.celebrado import Celebrado
from schema import evento as schema_event
from models import evento as models_event
from models import evento_participantes as event_part
from models.pagos import Pagos
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from utils.dependencies import current_user, admin_required



router=APIRouter(prefix="/event", tags=["event"])

@router.post("/create/Bautizo")
def create_bautizo(evento:schema_event.EventCreateModel,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        user_id=user_data["id_usuario"]
        descripcion = ""
        id_tipo_evento = evento.id_tipo_evento
        for celebrado in evento.celebrado:
            if id_tipo_evento == 4:
                descripcion=celebrado.apellido_pat + ' ' +celebrado.apellido_mat +" & "+celebrado.apellido_pat+' '+celebrado.apellido_mat
            else:
                descripcion=celebrado.nombres+' '+celebrado.apellido_pat+' '+celebrado.apellido_mat

        if id_tipo_evento==1 or id_tipo_evento==2:
            descripcion+=" Bautizo"
        elif id_tipo_evento==3:
            descripcion += " Primera Comunion"
        elif id_tipo_evento==4:
            descripcion += " Confirmacion"
        elif id_tipo_evento==5:
            descripcion += " Matrimonio"
        else:
            descripcion += " XV Años"



        id_evento=create_event(descripcion,evento.fecha_inicio,evento.fecha_fin,id_tipo_evento,user_id,db)
        celebrado_list=[]

        for celebrado in evento.celebrado:
            id_celebrado=register_celebrated(id_evento,celebrado,db)
            celebrado_list.append(id_celebrado)

        participant_list=[]
        for participantes in evento.participantes:
            id_participante=register_participant(id_evento,participantes,db)
            if id_participante != None: participant_list.append(id_participante)

        metodo_pago(user_id,evento.pago,db)
        return {"msg" : "Registrado correctamente", "res" : {
            "evento" : id_evento,
            "user" : user_id,
            "id_celebrados" : celebrado_list,
            "ids_participantes" : participant_list
        }}
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


def create_event(descripcion:str,fecha_inicio:str,fecha_fin:str,id_tipo_evento:int,user_id:int, db:Session):
    #fecha=datetime.datetime.utcnow() #Modificar al momento en el que se haga en el front
    folio=get_last_folio(db)
    event=models_event.Evento(id_usuario=user_id,folio=folio,fecha_hora_inicio=fecha_inicio,fecha_hora_fin=fecha_fin,status="P",id_tipo_evento=id_tipo_evento,descripcion=descripcion)
    try:
        db.add(event)
        db.commit()
        db.refresh(event)
        return event.id_evento
    except Exception as error:
        raise HTTPException(status_code=444, detail=str(error))


def register_celebrated(id_evento:int,celebrated:schema_event.CelebratedModel,db:Session):
    try:
        celebrado = Celebrado(id_evento=id_evento, nombres=celebrated.nombres,
                            apellido_pat=celebrated.apellido_pat, apellido_mat=celebrated.apellido_mat,
                            id_rol=celebrated.id_rol,genero=celebrated.genero,fecha_nacimiento=celebrated.fecha_nac,edad=celebrated.edad)
        db.add(celebrado)
        db.commit()
        db.refresh(celebrado)
        return celebrado.id_celebrado
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))



def register_participant(id_evento:int,participant:schema_event.ParticipantModel,db:Session):
    try:
        participante=event_part.EventoParticipante(id_evento=id_evento,nombres=participant.nombres,apellido_pat=participant.apellido_pat,apellido_mat=participant.apellido_mat,id_rol=participant.id_rol)
        db.add(participante)
        db.commit()
        db.refresh(participante)
        return participante.id_evento_participante if participante.id_rol in (4, 5) else None
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


def metodo_pago(user_id:int,pago:schema.evento.Pago,db:Session):
    try:
        pay=Pagos(fecha_hora=datetime.datetime.utcnow(),monto=pago.monto,id_usuario=user_id,descripcion=pago.descripcion)
        db.add(pay)
        db.commit()
        db.refresh(pay)
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))



def get_last_folio(db:Session):
    last=db.query(models_event.Evento).order_by(models_event.Evento.folio.desc()).first()
    if not last:
        return "00000001"
    new_folio=int(last.folio) + 1
    return f"{new_folio:08d}"

@router.post("/create/Parroquial")
def create_parroquial(parroquial: schema_event.ParroquialEvent,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):

    user_id=admin_data["id_usuario"]
    try:
        id=create_event(parroquial.descripcion,parroquial.fecha_inicio,parroquial.fecha_fin,6,user_id,db)
        return { "msg" : "Evento parroquial creado correctamente", "id_evento" : id }
    except Exception as error:
        raise HTTPException(status_code=444, detail=str(error))



@router.get("/get/all_parroquial")
def get_all_parroquial(db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        fecha=datetime.datetime.utcnow()

        parroquial=db.query(models_event.Evento).filter(and_(models_event.Evento.id_tipo_evento == 6, models_event.Evento.fecha_hora_fin >= fecha)).all()
        eventos=[]
        for e in parroquial:
            eventos.append({
                "descripcion" : e.descripcion,
                "fecha" : e.fecha_hora_inicio.date(),
                "hora_inicio":e.fecha_hora_inicio.strftime("%H:%M"),
                "hora_fin":e.fecha_hora_fin.strftime("%H:%M"),
            })
        return eventos
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/get/parroquial")
def get_parroquial(id_evento:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        parroquial=db.query(models_event.Evento).filter(and_(models_event.Evento.id_evento == id_evento)).first()


        return {"evento" : parroquial}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))



@router.put("/update/mark_realized_evento")
async def mark_realized(id_evento:int = Form(...),image:UploadFile=File(...),db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        os.makedirs(f"Images/realized/{id_evento}", exist_ok=True)

        # 🔹 Obtener extensión del tipo MIME
        mime_type = image.content_type  # ejemplo: "image/png"
        extension = mime_type.split("/")[-1]  # -> "png"

        new_filename = f"evidence_{id_evento}.{extension}"

        file_path=os.path.join("Images","realized",str(id_evento),new_filename) #combina rutas
        with open(file_path,"wb") as f: #crea un archivo nuevo
            shutil.copyfileobj(image.file, f) #copia el contenido del archivo original al nuevo

        status_schema=schema_event.StatusEvent(id_evento=id_evento,status="R",image=file_path)
        change_status_event(status_schema,db)

        return {"msg" : "Evento realizado con evidencia"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.put("/update/mark_notorpendient_event")
def mark_notorpendient(status:schema_event.StatusEvent,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        change_status_event(status,db)

        return {"msg" : "Status actualizado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

def change_status_event(status:schema_event.StatusEvent,db:Session):
    db.query(models_event.Evento).filter(models_event.Evento.id_evento == status.id_evento).update({"status": status.status,"evidencia":status.image})
    db.commit()
    return {"msg":True}


@router.delete("/delete/parroquial")
def delete_parroquial(id_evento:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        db.query(models_event.Evento).filter(models_event.Evento.id_evento == id_evento).delete()
        db.commit()
        return { "msg" : "Evento parroquial eliminado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.put("/update/parroquial")
def update_parroquial(id_evento:int,parroquial:schema_event.ParroquialEvent,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        db.query(models_event.Evento).filter(models_event.Evento.id_evento == id_evento).update(
            {"fecha_hora_inicio":parroquial.fecha_inicio,"fecha_hora_fin":parroquial.fecha_fin,"descripcion":parroquial.descripcion})
        db.commit()
        return { "msg" : "Evento actualizado"}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))