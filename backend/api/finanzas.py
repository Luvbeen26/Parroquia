import datetime
from io import BytesIO
from typing import Optional
from zoneinfo import ZoneInfo

from dns.reversename import to_address
from sqlalchemy import cast, Date, func, extract, desc, and_

from models import Transaccion
from services.email import send_email_comprobante
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Spacer, Paragraph, SimpleDocTemplate, Image, TableStyle, Table
from api.docs import sanitize_filename
import os
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse
from utils.database import get_db
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request,Query
from utils.dependencies import current_user, admin_required
from schema import finanzas
from models.comprobante import Comprobante

router=APIRouter(prefix="/finanzas", tags=["finanzas"])

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

@router.post("/register/transaccion")
def crear_Transaccion(monto: float = Form(...),id_categoria: int = Form(...),descripcion: str = Form(...),image: UploadFile | None = File(None),
        db: Session = Depends(get_db),admin_data: dict = Depends(admin_required)):
    try:
        user_id = admin_data["id_usuario"]
        fecha = datetime.datetime.now(MAZATLAN_TZ)


        transaccion = Transaccion(monto=monto,fecha=fecha.strftime("%Y-%m-%d %H-%M-%S"),id_categoria=id_categoria,
            descripcion=descripcion,id_usuario=user_id,evidencia=None)

        db.add(transaccion)
        db.commit()
        db.refresh(transaccion)

        if id_categoria > 4 and image is not None:
            return HTTPException(status_code=404, detail="Esta categoria no necesita de evidencia")
        if id_categoria <= 4 and image is not None:
            carpeta = f"Images/Gastos/Evidencia/{transaccion.id_transaccion}/"
            os.makedirs(carpeta, exist_ok=True)

            ruta = os.path.join(carpeta, image.filename)
            with open(ruta, "wb") as f:
                f.write(image.file.read())
            transaccion.evidencia = ruta
            db.commit()
        return {
            "msg": "Transacción registrada correctamente",
            "id_transaccion": transaccion.id_transaccion
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


async def generar_comprobante_pago(comprobante:finanzas.Comprobante,db: Session):
    folio=get_last_comprobant_folio(db)
    buffer = BytesIO()
    #Se crea el documento de tamaño A5
    pdf = SimpleDocTemplate(buffer, pagesize=A5)
    elements = [] #lista para almacenar los elementos


    styles = getSampleStyleSheet()
    estilo_titulo = ParagraphStyle(
        name="titulo",
        parent=styles["Heading1"],
        alignment=TA_CENTER
    )

    estilo_normal = ParagraphStyle(
        name="normal",
        parent=styles["Normal"],
        alignment=TA_CENTER
    )

    # Logo (opcional)
    try:
        logo = Image("Images/logo.jpg", width=1.5 * inch, height=2 * inch)
        elements.append(logo)
        elements.append(Spacer(1,10))
    except Exception as e:
        print("Logo sin encontrar")

    elements.append(Paragraph("<b>Comprobante de Pago</b>", estilo_titulo))
    elements.append(Spacer(1, 20))


    datos_generales = [
        ["Folio:", folio],
        ["Fecha:", comprobante.fecha],
        ["Cliente:", comprobante.nombre],
        ["Concepto:", comprobante.concepto],
        ["Monto:", f"${comprobante.monto:,.2f}"]
    ]

    tabla_info = Table(datos_generales, hAlign='CENTER', colWidths=[100, 100])
    tabla_info.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('BOX', (0, 0), (-1, -1), 0.75, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.grey),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica')
    ]))

    elements.append(tabla_info)


    # Firma o pie
    elements.append(Spacer(1, 50))
    elements.append(Paragraph("__________________________", estilo_normal))
    elements.append(Paragraph("Firma o sello del emisor", estilo_normal))

    elements.append(Spacer(1, 30))

    elements.append(Paragraph(
        "Gracias por su pago. Este comprobante es generado automáticamente por el sistema.",
        estilo_normal
    ))
    # 🔹 Generar PDF dentro del buffer
    pdf.build(elements)
    buffer.seek(0)

    carpeta = f"Documents/{comprobante.id_evento}/Comprobante/"
    os.makedirs(carpeta, exist_ok=True)
    ruta = os.path.join(carpeta, f"{folio}.pdf")
    with open(ruta, "wb") as f:
        f.write(buffer.getbuffer())
    add_comprobant(ruta,comprobante.id_evento,folio,comprobante.monto,comprobante.fecha,db)

    db.commit()
    await send_email_comprobante(ruta,comprobante.correo,"Comprobante de pago")
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=comprobante_{folio}.pdf"
        }
    )

def get_last_comprobant_folio(db: Session):
    try:
        last = db.query(Comprobante).order_by(Comprobante.folio_comprobante.desc()).first()

        if not last:
            return "CP000001"
        num_str = last.folio_comprobante.replace("CP", "")
        new_number = int(num_str) + 1

        new_folio = f"CP{new_number:06d}"
        return new_folio
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))

def add_comprobant(ruta:str,id_evento,folio:str,monto:float,fecha:str,db: Session):
    comprobante = Comprobante(id_evento=id_evento,folio_comprobante=folio,monto=monto,fecha_pago=fecha,ruta_pdf=ruta)
    db.add(comprobante)




@router.get("/show/all_transaccion")
def Show_all_transaccion(request:Request,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required),id_categoria:Optional[int] = Query(None),fecha_inicio:Optional[str] = Query(None),fecha_final:Optional[str] = Query(None)):
    try:
        if fecha_inicio is not None and fecha_final is not None and id_categoria is not None:
            transaccion = db.query(Transaccion).filter(and_(Transaccion.id_categoria == id_categoria,Transaccion.fecha > fecha_inicio,Transaccion.fecha < fecha_final)).order_by(desc(Transaccion.id_transaccion)).all()
        elif fecha_inicio is not None and fecha_final is not None:
            transaccion = db.query(Transaccion).filter(and_(Transaccion.fecha > fecha_inicio,Transaccion.fecha < fecha_final)).order_by(desc(Transaccion.id_transaccion)).all()
        elif id_categoria is not None and fecha_inicio is not None:
            transaccion = db.query(Transaccion).filter(and_(Transaccion.id_categoria == id_categoria,Transaccion.fecha > fecha_inicio)).order_by(
                desc(Transaccion.id_transaccion)).all()
        elif id_categoria is not None and fecha_final is not None:
            transaccion = db.query(Transaccion).filter(and_(Transaccion.id_categoria == id_categoria,Transaccion.fecha > fecha_final)).order_by(
                desc(Transaccion.id_transaccion)).all()
        elif id_categoria is not None:
            transaccion = db.query(Transaccion).filter(Transaccion.id_categoria == id_categoria).order_by(desc(Transaccion.id_transaccion)).all()
        elif fecha_inicio is not None:
            transaccion = db.query(Transaccion).filter(Transaccion.fecha > fecha_inicio).order_by(desc(Transaccion.id_transaccion)).all()
        elif fecha_final is not None:
            transaccion = db.query(Transaccion).filter(Transaccion.fecha < fecha_final).order_by(desc(Transaccion.id_transaccion)).all()
        else:
            transaccion=db.query(Transaccion).order_by(desc(Transaccion.id_transaccion)) .all()
        base_url = str(request.base_url).rstrip("/")
        res=[]
        for t in transaccion:
            documento_url=None
            if t.evidencia is not None:
                ruta = f"{base_url}/{t.evidencia}"
                documento_url = ruta.replace("\\", "/")
            res.append({
                "id_transaccion": t.id_transaccion,
                "monto" : t.monto,
                "fecha" : t.fecha,
                "descripcion" : t.descripcion,
                "id_categoria" : t.id_categoria,
                "categoria" : t.categoria.descripcion,
                "tipo_categoria" : t.categoria.tipo,
                "evidencia" : documento_url,
            })

        return res

    except  Exception as e:
        raise HTTPException(status_code=404,detail=str(e))


@router.delete("/delete/transaccion")
def DeleteTransaccion(id_transaccion:int,db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        transaccion = db.query(Transaccion).filter(Transaccion.id_transaccion == id_transaccion).first()

        if not transaccion:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")


        db.delete(transaccion)
        db.commit()
        return {"msg" : "Transaccion eliminada"}
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))


@router.put("/update/transaccion")
def UpdTransaccion(id_transaccion: int = Form(...),monto: float = Form(...),id_categoria: int = Form(...),
        descripcion: str = Form(...),image: UploadFile | None = File(None),db: Session = Depends(get_db),
        admin_data: dict = Depends(admin_required)):
    try:
        update = db.query(Transaccion).filter(Transaccion.id_transaccion == id_transaccion).first()

        if update is None:
            raise HTTPException(status_code=404, detail="Transacción no identificada")

        if monto is not None:
            update.monto = monto
        if descripcion is not None:
            update.descripcion = descripcion
        if id_categoria is not None:
            update.id_categoria = id_categoria

        if id_categoria is not None:
            if id_categoria > 4:
                if update.evidencia and os.path.exists(update.evidencia):
                    try:
                        os.remove(update.evidencia)
                        carpeta = os.path.dirname(update.evidencia)
                        if os.path.exists(carpeta) and not os.listdir(carpeta):
                            os.rmdir(carpeta)
                    except Exception as e:
                        print(f"Error al eliminar evidencia: {e}")

                update.evidencia = None

            elif id_categoria <= 4 and image is not None:
                clean_filename = sanitize_filename(image.filename)
                carpeta = f"Images/Gastos/Evidencia/{update.id_transaccion}/"
                os.makedirs(carpeta, exist_ok=True)
                nueva_ruta = os.path.join(carpeta, clean_filename)

                if update.evidencia and os.path.exists(update.evidencia):
                    try:
                        os.remove(update.evidencia)
                    except Exception as e:
                        print(f"Error al eliminar evidencia anterior: {e}")


                with open(nueva_ruta, "wb") as f:
                    f.write(image.file.read())

                update.evidencia = nueva_ruta

        db.commit()
        db.refresh(update)

        return {"msg": "Transacción actualizada exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar transacción: {str(e)}")