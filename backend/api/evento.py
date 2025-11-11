import os
import shutil
from zoneinfo import ZoneInfo

from sqlalchemy import and_, func, cast, Date, or_
from sqlalchemy.orm import Session, joinedload
import datetime
from utils.scheduler import scheduler
from watchfiles import Change

import schema.evento
from api.notif import send_notification
from models.celebrado import Celebrado
from schema import evento as schema_event
from schema import finanzas as schema_finanzas
from models import evento as models_event, Evento
from models import evento_participantes as event_part
from api import finanzas
from models.pagos import Pagos
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form
from utils.dependencies import current_user, admin_required
from services import email


MAZATLAN_TZ = ZoneInfo("America/Mazatlan")
meses=["Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"]

router=APIRouter(prefix="/event", tags=["event"])

@router.post("/create/Event")
async def create_event(
        evento:schema_event.EventCreateModel,
        db:Session = Depends(get_db), user_data:dict=Depends(current_user)):
    try:
        user_id=user_data["id_usuario"]
        descripcion = ""
        #ID DE EVENTO
        id_tipo_evento = evento.id_tipo_evento

        #DESCRIPCION DE EVENTO
        if id_tipo_evento==1 or id_tipo_evento==2:
            descripcion="Bautizo - "
        elif id_tipo_evento==3:
            descripcion = "Primera Comunion - "
        elif id_tipo_evento==4:
            descripcion = "Confirmacion - "
        elif id_tipo_evento==5:
            descripcion = "Matrimonio - "
        else:
            descripcion = "XV Años - "

        for celebrado in evento.celebrado:
            if id_tipo_evento == 4:
                descripcion+=celebrado.apellido_pat + ' ' +celebrado.apellido_mat +" & "+celebrado.apellido_pat+' '+celebrado.apellido_mat
            else:
                descripcion+=celebrado.nombres+' '+celebrado.apellido_pat+' '+celebrado.apellido_mat

        register = schema_event.RegisterModel(
            descripcion=descripcion,
            fecha_inicio=evento.fecha_inicio,
            fecha_fin=evento.fecha_fin,
            id_tipo_evento=id_tipo_evento
        )

        id_evento=register_event(register,user_id,db)
        celebrado_list=[]

        for celebrado in evento.celebrado:
            id_celebrado=register_celebrated(id_evento,celebrado,db)
            celebrado_list.append(id_celebrado)

        participant_list=[]
        for participantes in evento.participantes:
            id_participante=register_participant(id_evento,participantes,db)
            if id_participante != None: participant_list.append(id_participante)

        metodo_pago(user_id,evento.pago,db)

        name=user_data["nombre"]
        email=user_data["correo"]

        #SACAR EL MONTO DE LA BD PARA EVITAR QUE LO EDITEN EN FRONT
        comproba = schema_finanzas.Comprobante(
            id_evento=id_evento,
            nombre=name,
            correo=email,
            concepto=f"Pago {descripcion}",
            monto=evento.pago.monto,
            fecha=datetime.datetime.now(MAZATLAN_TZ).strftime("%Y-%m-%d %H:%M:%S")
        )

        await finanzas.generar_comprobante_pago(comproba,db)

        fecha_inicio_dt = datetime.datetime.strptime(evento.fecha_inicio, "%Y-%m-%d %H:%M:%S")
        tiempo_notificacion = fecha_inicio_dt  - datetime.timedelta(days=1)
        scheduler.add_job(
            send_notification,
            'date',
            run_date=tiempo_notificacion,
            args=[user_id, f"El {descripcion} se llevará a cabo en 1 día", datetime.datetime.now(MAZATLAN_TZ), "E",db]
        )

        return {"msg" : "Registrado correctamente", "res" : {
            "evento" : id_evento,
            "user" : user_id,
            "id_celebrados" : celebrado_list,
            "ids_participantes" : participant_list
        }}
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


def register_event(register:schema_event.RegisterModel,user_id:int, db:Session):
    #fecha=datetime.datetime.utcnow() #Modificar al momento en el que se haga en el front
    folio=get_last_folio(db)
    event=models_event.Evento(id_usuario=user_id,folio=folio,fecha_hora_inicio=register.fecha_inicio,fecha_hora_fin=register.fecha_fin,status="P",id_tipo_evento=register.id_tipo_evento,descripcion=register.descripcion)
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
        pay=Pagos(fecha_hora=datetime.datetime.now(MAZATLAN_TZ),monto=pago.monto,id_usuario=user_id,descripcion=pago.descripcion)
        db.add(pay)
        db.commit()
        db.refresh(pay)
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


def get_last_folio(db: Session):
    last = db.query(models_event.Evento).order_by(models_event.Evento.folio.desc()).first()

    if not last:
        return "EVT000001"
    num_str = last.folio.replace("EVT", "")
    new_number = int(num_str) + 1

    new_folio = f"EVT{new_number:06d}"
    return new_folio

@router.post("/create/Parroquial")
def create_parroquial(parroquial: schema_event.ParroquialEvent,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):

    user_id=admin_data["id_usuario"]
    try:
        id=create_event(parroquial.descripcion,parroquial.fecha_inicio,parroquial.fecha_fin,6,user_id,db)
        return { "msg" : "Evento parroquial creado correctamente", "id_evento" : id }
    except Exception as error:
        raise HTTPException(status_code=444, detail=str(error))



@router.get("/get/all_parroquial")
def get_all_parroquial(db:Session = Depends(get_db)):
    try:
        fecha=datetime.datetime.now(MAZATLAN_TZ)

        parroquial=db.query(models_event.Evento).filter(and_(models_event.Evento.id_tipo_evento == 6, models_event.Evento.fecha_hora_fin >= fecha)).all()
        eventos=[]
        for e in parroquial:
            og_fecha=e.fecha_hora_inicio.date()
            fecha_split=str(og_fecha).split("-")
            fecha_format=f"{fecha_split[2]} de {meses[int(fecha_split[1])-1]} de {fecha_split[0]}"


            eventos.append({
                "descripcion" : e.descripcion,
                "fecha" : fecha_format,
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



@router.get("/show/today_events")
def show_manyevents(db:Session = Depends(get_db)):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        cantidad=db.query(func.count(Evento.id_evento)).filter(cast(Evento.fecha_hora_inicio, Date) == hoy).scalar()
        cantidad=cantidad or 0
        return cantidad
    except Exception as error:
        print(error)

@router.get("/show/user/eventos")
def show_userevents(db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        eventos=db.query(Evento).filter(Evento.id_usuario == user_data["id_usuario"]).all()

        prox=[e for e in eventos if e.status == "P" ]
        pasados=[e for e in eventos if e.status != "P" ]

        return{
            "prox": prox,
            "pasado": pasados,
        }

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/show/user/pendientes_eventos")
def show_pendients(db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        eventos=db.query(Evento).options(joinedload(Evento.documentos)).filter(and_(Evento.id_usuario == user_data["id_usuario"],Evento.status == "P")).all()

        result = []
        for evento in eventos:

            result.append({
                "id_evento": evento.id_evento,
                "id_tipo" :evento.id_tipo_evento,
                "descripcion": evento.descripcion,
                "documentos": [{"id_documento": doc.id_documento,"descripcion":f"{doc.tipo_documento.descripcion} {doc.participante.rol.descripcion if doc.participante else ''}" ,"id_tipo":doc.id_tipo_documento ,"ruta": doc.ruta,"motivo":doc.motivo_rechazo,"status":doc.status} for doc in evento.documentos]
            })

        return result

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/show/user/pendientes&prox")
def show_pendients_and_prox(db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    try:
        tipos_evento = {
            1: "Bautizo",
            2: "Bautizo",
            3: "Primera Comunión",
            4: "Matrimonio",
            5: "XV Años",
            7: "Confirmación",
        }

        eventos_p=db.query(Evento).filter(and_(Evento.id_usuario == user_data["id_usuario"],Evento.status == "P",Evento.id_tipo_evento != 6)).all()
        eventos_an = db.query(Evento).filter(Evento.id_usuario == user_data["id_usuario"], or_(Evento.status == "A", Evento.status == "N"), Evento.id_tipo_evento != 6)


        pendients=[]
        past=[]
        for evento in eventos_p:

            fecha = evento.fecha_hora_inicio.date().isoformat()  # devuelve "2025-10-29"
            hora = evento.fecha_hora_inicio.time().strftime("%H:%M")
            pendients.append({
                "id_evento": evento.id_evento,
                "tipo" :tipos_evento.get(evento.id_tipo_evento, "Desconocido"),
                "descripcion": evento.descripcion.split(" - ")[1],
                "date": fecha,
                "hour": hora,
                "status" : "Pendiente"
            })

        for evento in eventos_an:
            fecha = evento.fecha_hora_inicio.date().isoformat()  # devuelve "2025-10-29"
            hora = evento.fecha_hora_inicio.time().strftime("%H:%M")
            past.append({
                "id_evento": evento.id_evento,
                "tipo": tipos_evento.get(evento.id_tipo_evento, "Desconocido"),
                "descripcion": evento.descripcion.split(" - ")[1],
                "date": fecha,
                "hour": hora,
                "status" : "Asistido" if evento.status == "A" else "No Asistido",
            })
        return {
            "prox": pendients,
            "past":past
        }

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/parroquiales/ocupados")
def eventos_ocupados(db: Session = Depends(get_db)):
    hoy = datetime.datetime.now(MAZATLAN_TZ)
    eventos = db.query(Evento.fecha_hora_inicio, Evento.fecha_hora_fin).filter(
        and_(
            or_(Evento.id_tipo_evento == 6),  # solo parroquiales,privados,xv
            Evento.fecha_hora_fin >= hoy  # que no hayan terminado
        )
    ).all()

    return [
        {"inicio": e.fecha_hora_inicio.isoformat(), "fin": e.fecha_hora_fin.isoformat()}
        for e in eventos
    ]

@router.patch("/update/reagendar")
def reagendar(chng:schema_event.ChangeDate,db:Session=Depends(get_db)):
    try:
        db.query(Evento).filter(Evento.id_evento == chng.id_evento).update(
            {"fecha_hora_inicio": chng.fecha_inicio, "fecha_hora_fin": chng.fecha_fin})
        db.commit()
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

    return chng