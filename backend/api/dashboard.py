import datetime
from doctest import debug_script
from zoneinfo import ZoneInfo
from sqlalchemy import cast, Date, func, extract, case
from models import Evento, Documento, TipoEvento
from sqlalchemy.orm import Session
from utils.database import get_db
from models.pagos import Pagos
from models.gastos import Gastos
from fastapi import APIRouter, Depends, HTTPException
from utils.dependencies import admin_required
from dateutil.relativedelta import relativedelta
from google import genai
from google.genai import types
import os
from config.setting import settings

Apikey=settings.GEMINI_KEY

MAZATLAN_TZ = ZoneInfo("America/Mazatlan")

router=APIRouter(prefix="/dashboard", tags=["dashboard"])


def show_manyevents(db:Session = Depends(get_db)):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        cantidad=db.query(func.count(Evento.id_evento)).filter(cast(Evento.fecha_hora_inicio, Date) == hoy).scalar()
        cantidad=cantidad or 0
        return cantidad
    except Exception as error:
        print(error)



def ver_ganancias(db:Session):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        total_monto=db.query(func.sum(Pagos.monto)).filter(cast(Pagos.fecha_hora, Date) == hoy).scalar()
        total_monto=total_monto or 0
        return total_monto
    except Exception as error:
        print(error)




def show_pendientdocs(db:Session):
    try:
        cantidad=db.query(func.count(Documento.id_evento)).filter(Documento.status == "Pendiente").scalar()
        cantidad=cantidad or 0
        return cantidad
    except Exception as error:
        print(error)

@router.get("/get/info_cards")
def get_info_cards(db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        return {
            "Docs_pendients":show_pendientdocs(db),
            "Show_Earnings":ver_ganancias(db),
            "Show_Events":show_manyevents(db)
        }
    except Exception as error:
        raise HTTPException(status_code=404, detail=error)


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


@router.get("/response/geminifinances")
def resumenGemini(db:Session = Depends(get_db),admin_data:dict=Depends(admin_required)):
    try:
        jsonData=GetDataForGemini(db)
        client=genai.Client(api_key=Apikey)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Dame un resumen directo y conciso sobre los ingresos egresos y ganancias Así como los eventos realizados(Bautizo Privado/comunitario,Confirmacion,Primera Comunion,etc) en el último mes comparados con los meses anteriores "
                     "Calcula porcentajes cuando sea posible Menciona los meses usando su nombre en lugar de números. No incluyas encabezados ni títulos ni listas estructuradas. Evita cualquier texto "
                     "introductorio y usa signos de puntuacion. Al final agrega puntos de mejora basados en los datos Solo usa texto plano Aquí están los datos.Cuando hables de "
                     "dinero pon el signo de $"+str(jsonData)

        )

        return {"resumen" :response.text}
    except Exception as error:
        raise HTTPException(status_code=404, detail=error)

"""
Ingresos_al_mes:
Ingresos_anteriores_meses:
gastos_mes:
Gastos_anteriores_meses:
Gananacias_mes:
Ganancias_meses_anteriores
Eventos_cantidad_por_mes
que diga porcentajes
"""

def GetDataForGemini(db:Session):
    hoy= datetime.datetime.now(MAZATLAN_TZ).date()
    last30d= hoy - datetime.timedelta(days=30)
    sixmonths = hoy - relativedelta(months=6)

    #Ultimo mes
    ipm=db.query(func.sum(Pagos.monto)).filter(Pagos.fecha_hora >= last30d).scalar() or 0

    #Ultimos 6 meses
    res_ingresos = db.query(
        extract('month', Pagos.fecha_hora).label('mes'),
        func.sum(Pagos.monto).label('total_ingresos')
    ).filter(Pagos.fecha_hora >= sixmonths).group_by('mes').all()

    res_ingresos_list = [
        {"mes": int(r.mes), "total_ingresos": float(r.total_ingresos)}
        for r in res_ingresos
    ]

    #Gastos mes
    gpm=db.query(func.sum(Gastos.monto)).filter(Gastos.fecha_hora >= last30d).scalar() or 0

    #gastos 6 meses
    res_gastos = db.query(
        extract('month', Gastos.fecha_hora).label('mes'),
        func.sum(Gastos.monto).label('total_egresos')
    ).filter(Gastos.fecha_hora >= sixmonths).group_by(
        'mes'
    ).all()

    res_gastos_list = [
        {"mes": int(r.mes), "total_egresos": float(r.total_egresos)}
        for r in res_gastos
    ]

    #Ganancias del mes
    Ganancias_mes=float(ipm) - float(gpm)


    #Ganancias 6 meses
    Ganancias_sixmonths=[]
    for i,g in zip(res_ingresos,res_gastos):
        Ganancias_sixmonths.append(float(i.total_ingresos)-float(g.total_egresos))

    #Eventos por mes
    events_last6 = (
        db.query(
            TipoEvento.descripcion.label("tipo_evento"),
            func.extract('year', Evento.fecha_hora_inicio).label("anio"),
            func.extract('month', Evento.fecha_hora_inicio).label("mes"),
            func.count(Evento.id_evento).label("cantidad")
        )
        .join(TipoEvento, Evento.id_tipo_evento == TipoEvento.id_tipo_evento)
        .filter(Evento.fecha_hora_inicio >= sixmonths)
        .group_by("tipo_evento", "anio", "mes")
        .order_by("anio", "mes", "tipo_evento")
        .all()
    )
    events_last6_list = [
        {
            "tipo_evento": r.tipo_evento,
            "anio": int(r.anio),
            "mes": int(r.mes),
            "cantidad": int(r.cantidad)
        }
        for r in events_last6
    ]


    return {
        "Dia actual":hoy,
        "Ingresos_last_month":float(ipm),
        "Ingresos_6months":res_ingresos_list,
        "Gastos_last_month":float(gpm),
        "Gastos_6months":res_gastos_list,
        "Ganancias_last_month":float(Ganancias_mes),
        "Ganancias_6months":Ganancias_sixmonths,
        "Eventos_6months":events_last6_list
    }


@router.get("/show/events_lastest_months")
def show_events_lastesmonths(db:Session = Depends(get_db)):
    try:
        hoy = datetime.datetime.now(MAZATLAN_TZ).date()
        hace_30_dias = hoy - datetime.timedelta(days=30)

        # 1. Obtener todos los tipos (excepto id=6)
        tipos = (
            db.query(TipoEvento.descripcion)
            .filter(TipoEvento.id_tipo_evento != 6)
            .all()
        )
        tipos = [t.descripcion for t in tipos]

        # 2. Agrupar Comunitario + Privado como "Bautizo" usando CASE
        tipo_agrupado = case(
            (TipoEvento.descripcion.in_(["Comunitario", "Privado"]), "Bautizo"),
            else_=TipoEvento.descripcion
        ).label("tipo_evento")

        # 3. Consulta con tipos agrupados
        eventos_ultimos_30 = (
            db.query(
                tipo_agrupado,
                func.count(Evento.id_evento).label("cantidad")
            )
            .join(TipoEvento, Evento.id_tipo_evento == TipoEvento.id_tipo_evento)
            .filter(Evento.fecha_hora_inicio >= hace_30_dias)
            .filter(Evento.fecha_hora_inicio <= hoy)
            .filter(TipoEvento.id_tipo_evento != 6)
            .group_by(tipo_agrupado)
            .order_by(tipo_agrupado)
            .all()
        )

        # Crear diccionario
        eventos_dict = {r.tipo_evento: int(r.cantidad) for r in eventos_ultimos_30}

        # 4. Crear lista final con tipos faltantes = 0
        result = []
        for tipo in tipos:

            # Ajuste de nombre para la salida final
            nombre = "Bautizo" if tipo in ("Comunitario", "Privado") else tipo

            cantidad = eventos_dict.get(nombre, 0)

            # Evitar duplicar "Bautizo"
            if nombre == "Bautizo" and any(r["tipo_evento"] == "Bautizo" for r in result):
                continue

            result.append({
                "tipo_evento": nombre,
                "cantidad": cantidad
            })

        return {
            "desde": hace_30_dias,
            "hasta": hoy,
            "eventos": result
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))



@router.get("/showing")
def GetDataForGemini2(db:Session = Depends(get_db)):
    hoy= datetime.datetime.now(MAZATLAN_TZ).date()
    last30d= hoy - datetime.timedelta(days=30)
    sixmonths = hoy - relativedelta(months=6)

    #Ultimo mes
    ipm=db.query(func.sum(Pagos.monto)).filter(Pagos.fecha_hora >= last30d).scalar() or 0

    #Ultimos 6 meses
    res_ingresos = db.query(
        extract('month', Pagos.fecha_hora).label('mes'),
        func.sum(Pagos.monto).label('total_ingresos')
    ).filter(Pagos.fecha_hora >= sixmonths).group_by('mes').all()

    res_ingresos_list = [
        {"mes": int(r.mes), "total_ingresos": float(r.total_ingresos)}
        for r in res_ingresos
    ]

    #Gastos mes
    gpm=db.query(func.sum(Gastos.monto)).filter(Gastos.fecha_hora >= last30d).scalar() or 0

    #gastos 6 meses
    res_gastos = db.query(
        extract('month', Gastos.fecha_hora).label('mes'),
        func.sum(Gastos.monto).label('total_egresos')
    ).filter(Gastos.fecha_hora >= sixmonths).group_by(
        'mes'
    ).all()

    res_gastos_list = [
        {"mes": int(r.mes), "total_egresos": float(r.total_egresos)}
        for r in res_gastos
    ]

    #Ganancias del mes
    Ganancias_mes=float(ipm) - float(gpm)


    #Ganancias 6 meses
    Ganancias_sixmonths=[]
    for i,g in zip(res_ingresos,res_gastos):
        Ganancias_sixmonths.append(float(i.total_ingresos)-float(g.total_egresos))

    #Eventos por mes
    events_last6 = (
        db.query(
            TipoEvento.descripcion.label("tipo_evento"),
            func.extract('year', Evento.fecha_hora_inicio).label("anio"),
            func.extract('month', Evento.fecha_hora_inicio).label("mes"),
            func.count(Evento.id_evento).label("cantidad")
        )
        .join(TipoEvento, Evento.id_tipo_evento == TipoEvento.id_tipo_evento)
        .filter(Evento.fecha_hora_inicio >= sixmonths)
        .group_by("tipo_evento", "anio", "mes")
        .order_by("anio", "mes", "tipo_evento")
        .all()
    )
    events_last6_list = [
        {
            "tipo_evento": r.tipo_evento,
            "anio": int(r.anio),
            "mes": int(r.mes),
            "cantidad": int(r.cantidad)
        }
        for r in events_last6
    ]


    return {
        "Dia actual": hoy,
        "Ingresos_last_month":float(ipm),
        "Ingresos_6months":res_ingresos_list,
        "Gastos_last_month":float(gpm),
        "Gastos_6months":res_gastos_list,
        "Ganancias_last_month":float(Ganancias_mes),
        "Ganancias_6months":Ganancias_sixmonths,
        "Eventos_6months":events_last6_list
    }
