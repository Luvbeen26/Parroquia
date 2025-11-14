import { get_user_docs } from "./document"

export interface parroquial{
    descripcion:string,
    fecha:string,
    hora_inicio:string,
    hora_fin:string
}

export interface Parents{
    nombres: string,
    apellido_pat: string,
    apellido_mat: string,
    id_rol:number
}

export interface Celebrate{
    nombres: string,
    apellido_pat: string,
    apellido_mat: string,
    id_rol:number,
    genero: string,
    fecha_nac: string, 
    edad: number
    //tipo: number
}

export interface PendientProcessClient{
    id_evento:number,
    descripcion:string,
    documentos:get_user_docs[]
}

export interface getEventInfo{
    id_evento:number,
    descripcion:string,
    tipo:string,
    date:string,
    hour:string,
    status:string
}

export interface ProxPastEventsClient{
    prox:getEventInfo[],
    past:getEventInfo[]
}


export interface DateTime{
    fecha:string,
    hrs_disponibles:string[]
}

export interface CreateEvent{
    id_tipo_evento:number,
    fecha_inicio:string,
    fecha_fin:string,
    celebrado:Celebrate[],
    participantes:Parents[]
}


