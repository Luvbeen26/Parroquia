import datetime
from io import BytesIO
from zoneinfo import ZoneInfo

from dns.reversename import to_address
from sqlalchemy import cast, Date, func, extract

from services.email import send_email_comprobante
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Spacer, Paragraph, SimpleDocTemplate, Image, TableStyle, Table

import os
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from utils.database import get_db
from models.pagos import Pagos
from models.gastos import Gastos
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from utils.dependencies import current_user, admin_required
from reportlab.lib.pagesizes import A4, A5, A6
from dateutil.relativedelta import relativedelta
from schema import finanzas
from models.comprobante import Comprobante

router=APIRouter(prefix="/finanzas", tags=["finanzas"])

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

@router.get("/show/lastest_months")
def show_lastesmonths(db:Session = Depends(get_db)):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        meses = []
        for i in range(6, 0, -1):
            mes_fecha = hoy - relativedelta(months=i)
            meses.append({"anio": mes_fecha.year, "mes": mes_fecha.month})
        sixmonths=hoy-relativedelta(months=6)

        res_ingresos=db.query(
            #estructura de tabla y de donde saca los valores
            extract('year',Pagos.fecha_hora).label('anio'),
            extract('month', Pagos.fecha_hora).label('mes'),
            func.sum(Pagos.monto).label('total_ingresos')
        ).filter(Pagos.fecha_hora >= sixmonths).group_by(
            'anio','mes'
        ).all()

        res_gastos = db.query(
            # estructura de tabla y de donde saca los valores
            extract('year', Gastos.fecha_hora).label('anio'),
            extract('month', Gastos.fecha_hora).label('mes'),
            func.sum(Gastos.monto).label('total_egresos')
        ).filter(Gastos.fecha_hora >= sixmonths).group_by(
            'anio', 'mes'
        ).all()

        ingresos = {(int(i.anio), int(i.mes)): float(i.total_ingresos) for i in res_ingresos}
        egresos = {(int(g.anio), int(g.mes)): float(g.total_egresos) for g in res_gastos}

        data=[]
        for m in meses:
            key = (m["anio"], m["mes"])
            data.append({
                "anio": m["anio"],
                "mes": m["mes"],
                "ingresos": ingresos.get(key, 0),
                "egresos":  egresos.get(key, 0),
            })

        return data
    except Exception as error:
        print(error)


@router.post("/show/earnings")
def ver_ganancias(db:Session = Depends(get_db)):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        total_monto=db.query(func.sum(Pagos.monto)).filter(cast(Pagos.fecha_hora, Date) == hoy).scalar()
        total_monto=total_monto or 0
        return total_monto
    except Exception as error:
        print(error)

@router.post("/register/pago")
def crear_pago(datos_pago:finanzas.Pago,db: Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now(MAZATLAN_TZ)
        pago=Pagos(fecha_hora=fecha.strftime("%Y-%m-%d %H-%M-%S"),monto=datos_pago.monto,id_usuario=user_id,descripcion=datos_pago.descripcion)
        db.add(pago)
        db.commit()
        return {"msg" : "Pago registrado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/register/gastos")

def crear_gastos(descripcion:str=Form(...),monto:float = Form(...),image:UploadFile=File(...),db: Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        user_id=admin_data["id_usuario"]
        fecha=datetime.datetime.now(MAZATLAN_TZ)

        gasto=Gastos(fecha_hora=fecha.strftime("%Y-%m-%d %H-%M-%S"),monto=monto,id_usuario=user_id,descripcion=descripcion,evidencia="")
        db.add(gasto)
        db.commit()
        db.refresh(gasto)
        carpeta = f"Images/Gastos/Evidencia/{gasto.id_gasto}/"
        os.makedirs(carpeta, exist_ok=True)
        ruta = os.path.join(carpeta, image.filename)
        with open(ruta, "wb") as f:
            f.write(image.file.read())
        gasto.evidencia=ruta
        db.commit()
        db.refresh(gasto)
        return {"msg": "Gasto registrado correctamente", "id_gasto": gasto.id_gasto}

    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))




#@router.get()
#def get_comprobante()


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