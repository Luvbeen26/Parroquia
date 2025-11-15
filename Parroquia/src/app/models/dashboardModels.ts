export interface CardsInfo{
    Docs_pendients:number,
    Show_Earnings:number,
    Show_Events:number
}

export interface ChartGetData{
    anio: number;
    mes: number;
    ingresos: number;
    egresos: number;
}

export interface ResumeIA{
    resumen:string
}

export interface PieEvents{
    tipo_evento:string,
    cantidad:number
}

export interface ChartGetDataPie{
    desde:string,
    hasta:string,
    eventos:PieEvents[]
}