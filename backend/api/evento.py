import os
import shutil
from zoneinfo import ZoneInfo

from sqlalchemy import and_, func, cast, Date, or_, extract, desc
from sqlalchemy.orm import Session, joinedload
import datetime


from utils.scheduler import scheduler

from api.notif import send_notification
from models.celebrado import Celebrado
from schema import evento as schema_event
from schema import finanzas as schema_finanzas
from models import evento as models_event, Evento, TipoEvento
from models import evento_participantes as event_part
from models import User
from api import finanzas
from models.transaccion import Transaccion
from models.pagos import Pagos
from utils.database import get_db
from fastapi import APIRouter,Depends, HTTPException, UploadFile, File, Form,Request
from utils.dependencies import current_user, admin_required
from services import email

#link_api="http://localhost:8000/"


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
        user_exists = db.query(User).filter_by(id_usuario=user_id).first()
        if not user_exists:
            raise HTTPException(
                status_code=400,
                detail=f"Usuario con id {user_id} no existe en la base de datos"
            )
        descripcion = ""
        #ID DE EVENTO
        id_tipo_evento = evento.id_tipo_evento
        if id_tipo_evento not in [1,2,3,4,5,7]:
            db.rollback()
            raise HTTPException(status_code=404, detail="Tipo de evento inexistente")

        #DESCRIPCION DE EVENTO

        if id_tipo_evento==1 or id_tipo_evento==2:
            descripcion="Bautizo - "
        elif id_tipo_evento==3:
            descripcion = "Primera Comunion - "
        elif id_tipo_evento==7:
            descripcion = "Confirmacion - "
        elif id_tipo_evento==4:
            descripcion = "Matrimonio - "
        elif id_tipo_evento == 5:
            descripcion = "XV Años - "

        print(3)
        for celebrado in evento.celebrado:
            if len(celebrado.apellido_mat) > 50 or len(celebrado.apellido_pat) > 50 or len(celebrado.nombres) > 50:
                raise HTTPException(status_code=404,detail="Nombres demasiados largos")

            if id_tipo_evento == 4 and len(evento.celebrado) == 2:
                descripcion += (f"{evento.celebrado[0].apellido_pat} {evento.celebrado[0].apellido_mat} & "f"{evento.celebrado[1].apellido_pat} {evento.celebrado[1].apellido_mat}")
            else:
                descripcion+=celebrado.nombres+' '+celebrado.apellido_pat+' '+celebrado.apellido_mat

        register = schema_event.RegisterModel(
            descripcion=None,
            fecha_inicio=evento.fecha_inicio,
            fecha_fin=evento.fecha_fin,
            id_tipo_evento=id_tipo_evento
        )
        print(4)
        #CREAR EVENTO
        id_evento=register_event(register,user_id,db)
        celebrado_list=[]

        for celebrado in evento.celebrado:
            id_celebrado=register_celebrated(id_evento,celebrado,db)
            celebrado_list.append(id_celebrado)

        participant_list=[]
        for participantes in evento.participantes:
            if len(participantes.apellido_mat) > 50 or len(participantes.apellido_pat) > 50 or len(participantes.nombres) > 50:
                raise HTTPException(status_code=404,detail="Nombre de Participante demasiados largos")
            id_participante=register_participant(id_evento,participantes,db)
            if id_participante != None: participant_list.append(id_participante)


        price = db.query(TipoEvento).filter_by(id_tipo_evento=id_tipo_evento).first().costo_programar
        print(6)

        metodo_pago(user_id,price,6,descripcion,db)

        name=user_data["nombre"]
        email=user_data["correo"]
        print(7)
        #SACAR EL MONTO DE LA BD PARA EVITAR QUE LO EDITEN EN FRONT
        comproba = schema_finanzas.Comprobante(
            id_evento=id_evento,
            nombre=name,
            correo=email,
            concepto=f"Pago {descripcion}",
            monto=float(price),
            fecha=datetime.datetime.now(MAZATLAN_TZ).strftime("%Y-%m-%d %H:%M:%S")
        )
        print("7.5")
        await finanzas.generar_comprobante_pago(comproba,db)
        print(8)
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
        db.rollback()
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


def metodo_pago(user_id:int, monto: float,id_categoria:int,descripcion: str,db:Session):
    try:
        pay=Transaccion(monto=monto,fecha=datetime.datetime.now(MAZATLAN_TZ),id_categoria=id_categoria,descripcion=descripcion,id_usuario=user_id)
        #pay=Pagos(fecha_hora=datetime.datetime.now(MAZATLAN_TZ),monto=monto,id_usuario=user_id,descripcion=descripcion)
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
        register_data = schema_event.RegisterModel(
            descripcion=parroquial.descripcion,
            fecha_inicio=parroquial.fecha_inicio,
            fecha_fin=parroquial.fecha_fin,
            id_tipo_evento=6
        )
        id=register_event(register_data,user_id,db)

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


        return {"descripcion" : parroquial.descripcion,
                "fecha_inicio":parroquial.fecha_hora_inicio,
                "fecha_fin":parroquial.fecha_hora_fin,
                "id_evento":id_evento}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))



@router.put("/update/mark_realized_evento")
async def mark_realized(id_evento:int = Form(...),image:UploadFile=File(...),db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        os.makedirs(f"Images/realized/{id_evento}", exist_ok=True)


        mime_type = image.content_type
        extension = mime_type.split("/")[-1]

        new_filename = f"evidence_{id_evento}.{extension}"

        file_path=os.path.join("Images","realized",str(id_evento),new_filename)
        with open(file_path,"wb") as f: #crea un archivo nuevo
            shutil.copyfileobj(image.file, f) #copia el contenido del archivo original al nuevo

        status_schema=schema_event.StatusEvent(id_evento=id_evento,status="A",image=file_path)
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
    if status.status == "R":
        db.query(models_event.Evento).filter(models_event.Evento.id_evento == status.id_evento).update(
            {"status": status.status, "fecha_hora_fin": None,"fecha_hora_fin":None})
    elif status.status in ["A","N","P"]:
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
        print(error)
        raise HTTPException(status_code=404, detail=str(error))





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
        eventos=(db.query(Evento).options(joinedload(Evento.documentos),joinedload(Evento.celebrados)).
                 filter(and_(or_(Evento.id_usuario == user_data["id_usuario"],Evento.status == "P",
                             Evento.id_usuario == user_data["id_usuario"],Evento.status == "R"),Evento.id_tipo_evento != 6))
                 .order_by(desc(Evento.id_evento)).all())

        result = []
        tipos=["Bautizo","Bautizo","Primera Comunion","Matrimonio","XV Años","Parroquial","Confirmacion"]
        descripcion=""
        for evento in eventos:
            nombres = [f"{c.nombres} {c.apellido_pat} {c.apellido_mat}" for c in evento.celebrados]

            if evento.id_tipo_evento == 4:
                descripcion = " & ".join(nombres)
            else:
                descripcion = " ".join(nombres)


            result.append({
                "id_evento": evento.id_evento,
                "id_tipo": evento.id_tipo_evento,
                "tipo" :f"{tipos[evento.id_tipo_evento-1]}",
                "status":evento.status,
                "descripcion": f"{descripcion}",
                "documentos": [{"id_documento": doc.id_documento,"descripcion":f"{doc.tipo_documento.descripcion} {doc.participante.rol.descripcion if doc.participante else ''}" ,"id_tipo":doc.id_tipo_documento ,"ruta": doc.ruta,"motivo":doc.motivo_rechazo,"status":doc.status} for doc in evento.documentos]
            })

        return result

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/show/user/past&prox")
def show_past_and_prox(db: Session = Depends(get_db), user_data: dict = Depends(current_user)):
    try:
        tipos_evento = {
            1: "Bautizo",
            2: "Bautizo",
            3: "Primera Comunión",
            4: "Matrimonio",
            5: "XV Años",
            7: "Confirmación",
        }

        # Agregar joinedload para traer los celebrados
        eventos_p = (db.query(Evento)
                     .options(joinedload(Evento.celebrados))
                     .filter(and_(
            Evento.id_usuario == user_data["id_usuario"],
            Evento.status == "P",
            Evento.id_tipo_evento != 6
        )).order_by(desc(Evento.fecha_hora_inicio)).all())

        eventos_an = (db.query(Evento)
                      .options(joinedload(Evento.celebrados))
                      .filter(
            Evento.id_usuario == user_data["id_usuario"],
            or_(Evento.status == "A", Evento.status == "N"),
            Evento.id_tipo_evento != 6
        ).order_by(desc(Evento.fecha_hora_inicio)).all())

        pendients = []
        past = []

        # Función helper para generar descripción
        def generar_descripcion(evento):
            nombres = [f"{c.nombres} {c.apellido_pat} {c.apellido_mat}" for c in evento.celebrados]

            if evento.id_tipo_evento == 4:  # Matrimonio
                descripcion = " & ".join(nombres)
            else:
                descripcion = " ".join(nombres)

            return descripcion

        # Procesar eventos pendientes
        for evento in eventos_p:
            fecha = evento.fecha_hora_inicio.date().isoformat()
            hora = evento.fecha_hora_inicio.time().strftime("%H:%M")

            pendients.append({
                "id_evento": evento.id_evento,
                "tipo": tipos_evento.get(evento.id_tipo_evento, "Desconocido"),
                "descripcion": generar_descripcion(evento),  # ✅ Genera la descripción dinámicamente
                "date": fecha,
                "hour": hora,
                "status": "Pendiente"
            })

        # Procesar eventos pasados
        for evento in eventos_an:
            fecha = evento.fecha_hora_inicio.date().isoformat()
            hora = evento.fecha_hora_inicio.time().strftime("%H:%M")

            past.append({
                "id_evento": evento.id_evento,
                "tipo": tipos_evento.get(evento.id_tipo_evento, "Desconocido"),
                "descripcion": generar_descripcion(evento),  # ✅ Genera la descripción dinámicamente
                "date": fecha,
                "hour": hora,
                "status": "Asistido" if evento.status == "A" else "No Asistido",
            })

        return {
            "prox": pendients,
            "past": past
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
def reagendar(chng:schema_event.ChangeDate,db:Session=Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        db.query(Evento).filter(Evento.id_evento == chng.id_evento).update(
            {"fecha_hora_inicio": chng.fecha_inicio, "fecha_hora_fin": chng.fecha_fin})
        db.commit()
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

    return chng

@router.get("/horas-disponibles",response_model=schema_event.ResponseHrsDisponibles)
def AvailableHours(fecha:str,id_tipo_evento:int,db:Session=Depends(get_db)):
    horas=[
        datetime.time(8, 0), datetime.time(9, 0), datetime.time(10, 0),
        datetime.time(11, 0),datetime.time(12, 0),datetime.time(13, 0),
        datetime.time(14, 0), datetime.time(15, 0), datetime.time(16, 0),
        datetime.time(17, 0), datetime.time(18, 0), datetime.time(19, 0)
    ]

    comunitarios=[1,3,7]

    if id_tipo_evento in comunitarios:
        ocupado=(db.query(Evento).
                 filter(func.date(Evento.fecha_hora_inicio) == fecha,
                        Evento.id_tipo_evento != id_tipo_evento).all())
    else:
        ocupado = (db.query(Evento).filter(func.date(Evento.fecha_hora_inicio) == fecha).all())
    horas_ocupadas = [c.fecha_hora_inicio.time() for c in ocupado]
    horas_disponibles = [h.strftime("%H:%M:%S") for h in horas if h not in horas_ocupadas]

    return {"fecha": fecha, "hrs_disponibles": horas_disponibles}


@router.get("/show/event_price")
def price(id_tipo_evento:int,db:Session=Depends(get_db)):
    try:
        price = db.query(TipoEvento).filter_by(id_tipo_evento=id_tipo_evento).first().costo_programar

        return { "price" : price}
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

#POR MES
@router.get("/show/month_events")
def month_events(request: Request, year: int, month: int, db: Session = Depends(get_db)):
    try:
        tipos_evento = {1: "Bautizo", 2: "Bautizo", 3: "Primera Comunión", 4: "Matrimonio", 5: "XV Años",
                        6: "Parroquial", 7: "Confirmación"}
        eventos_month = (db.query(Evento).filter(extract('month', Evento.fecha_hora_inicio) == month)
                         .filter(extract('year', Evento.fecha_hora_inicio) == year).order_by(
            Evento.fecha_hora_inicio).all())

        # Obtener la URL base
        base_url = str(request.base_url).rstrip("/")

        result = []
        nombre_c = ""
        for e in eventos_month:
            nombres = [f"{c.nombres} {c.apellido_pat} {c.apellido_mat}" for c in e.celebrados]

            if e.id_tipo_evento == 4:
                nombre_c = " & ".join(nombres)
            else:
                nombre_c = " ".join(nombres)

            if e.fecha_hora_inicio:
                fecha_i, hora_i = (str(e.fecha_hora_inicio).split(" ") + [None])[:2]
            else:
                fecha_i, hora_i = None, None

            if e.fecha_hora_fin:
                fecha_f, hora_f = (str(e.fecha_hora_fin).split(" ") + [None])[:2]
            else:
                fecha_f, hora_f = None, None

            # Construir URL completa para evidencia (igual que con publicaciones)
            evidencia_url = None
            if e.evidencia:
                evidencia_url = f"{base_url}/{e.evidencia.replace(chr(92), '/')}"

            result.append(
                {
                    "nombre_c": nombre_c if nombre_c != "" else None,
                    "status": e.status,
                    "descripcion": e.descripcion,
                    "evidencia": evidencia_url,  # Ahora es URL completa
                    "id_evento": e.id_evento,
                    "folio" : e.folio,
                    "fecha_inicio": fecha_i,
                    "hora_inicio": hora_i,
                    "fecha_fin": fecha_f,
                    "hora_fin": hora_f,
                    "tipo": tipos_evento.get(e.id_tipo_evento, "Desconocido"),
                    "fecha_hora_fin": e.fecha_hora_fin,
                }
            )

        return result

    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

#POR DIA
@router.get("/without/Forreagendar")
def forreagendar(db: Session = Depends(get_db)):
    try:
        tipos_evento = {1: "Bautizo", 2: "Bautizo", 3: "Primera Comunión", 4: "Matrimonio", 5: "XV Años",
                        6: "Parroquial", 7: "Confirmación"}
        events=db.query(Evento).filter(Evento.status == "R").all()
        result = []
        
        for e in events:
            nombres = [f"{c.nombres} {c.apellido_pat} {c.apellido_mat}" for c in e.celebrados]

            if e.id_tipo_evento == 4:
                nombre_c = " & ".join(nombres)
            else:
                nombre_c = " ".join(nombres)

            

            result.append(
                {
                    "nombre_c": nombre_c if nombre_c != "" else None,
                    "status": e.status,
                    "descripcion": e.descripcion,
                    "id_evento": e.id_evento,
                    "folio":e.folio,
                    "tipo": tipos_evento.get(e.id_tipo_evento, "Desconocido"),
                }
            )
        return result
    except Exception as error:
        raise HTTPException(status_code=404, detail=str(error))

@router.get("/Celebrants/User")
def Get_celebrantUser(id_evento:int,db:Session = Depends(get_db),user_data:dict=Depends(current_user)):
    print(user_data["id_usuario"])
    try:
        event=db.query(Evento).options(joinedload(Evento.celebrados),joinedload(Evento.evento_participante)).filter(Evento.id_evento == id_evento).first()
        if event is None:
            raise HTTPException(status_code=404, detail="Evento not found")
        if event.id_usuario != user_data["id_usuario"]:
            raise HTTPException(status_code=403, detail="El evento no es del usuario")


        return event
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))





@router.put("/update/Event")
def update_event(
        evento_data: schema_event.EventoUpdate,
        db: Session = Depends(get_db),
        user_data: dict = Depends(current_user)
):
    try:
        # 1. Verificar que el evento existe y pertenece al usuario
        evento = db.query(Evento).filter(Evento.id_evento == evento_data.id_evento).first()
        if not evento:
            raise HTTPException(status_code=404, detail="Evento no encontrado")

        if evento.id_usuario != user_data["id_usuario"]:
            raise HTTPException(status_code=403, detail="No autorizado")

        # 2. Actualizar datos del evento
        evento.fecha_hora_inicio = evento_data.fecha_inicio
        evento.fecha_hora_fin = evento_data.fecha_fin

        # 3. Actualizar o crear celebrados
        for celebrado_data in evento_data.celebrados:
            if celebrado_data.id_celebrado:
                # UPDATE - el celebrado ya existe
                celebrado = db.query(Celebrado).filter(
                    Celebrado.id_celebrado == celebrado_data.id_celebrado
                ).first()

                if celebrado:
                    celebrado.nombres = celebrado_data.nombres
                    celebrado.apellido_pat = celebrado_data.apellido_pat
                    celebrado.apellido_mat = celebrado_data.apellido_mat
                    celebrado.genero = celebrado_data.genero
                    celebrado.fecha_nacimiento = celebrado_data.fecha_nac
                    celebrado.edad = celebrado_data.edad
            else:
                # INSERT - nuevo celebrado
                nuevo_celebrado = Celebrado(
                    id_evento=evento_data.id_evento,
                    nombres=celebrado_data.nombres,
                    apellido_pat=celebrado_data.apellido_pat,
                    apellido_mat=celebrado_data.apellido_mat,
                    id_rol=celebrado_data.id_rol,
                    genero=celebrado_data.genero,
                    fecha_nacimiento=celebrado_data.fecha_nac,
                    edad=celebrado_data.edad
                )
                db.add(nuevo_celebrado)

        # 4. Actualizar o crear participantes
        for participante_data in evento_data.participantes:
            if participante_data.id_evento_participante:
                # UPDATE - el participante ya existe
                participante = db.query(event_part).filter(
                    event_part.id_evento_participante == participante_data.id_evento_participante
                ).first()

                if participante:
                    participante.nombres = participante_data.nombres
                    participante.apellido_pat = participante_data.apellido_pat
                    participante.apellido_mat = participante_data.apellido_mat
                    participante.id_rol = participante_data.id_rol
            else:
                # INSERT - nuevo participante
                nuevo_participante = event_part(
                    id_evento=evento_data.id_evento,
                    nombres=participante_data.nombres,
                    apellido_pat=participante_data.apellido_pat,
                    apellido_mat=participante_data.apellido_mat,
                    id_rol=participante_data.id_rol
                )
                db.add(nuevo_participante)

        db.commit()
        return {"message": "Evento actualizado exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))