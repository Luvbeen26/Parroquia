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
    tipo:string,
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


export interface GetMonthEvents{
    nombre_c: string,
    descripcion: string | null,
    id_evento: number,
    fecha_inicio: string,
    hora_inicio: string,    
    fecha_fin: string,    
    hora_fin: string,      
    tipo: string,       
    status: string,
    evidencia: string | null,
}


export interface CardsDayEvents{
    id_evento:number;
    nombre_c:string,
    fecha_inicio:string,
    tipo:string,
    status:string,
    evidencia:string | null
}

export interface MarkRealized{
    id:number,
    evidence:File
}


export interface MarkNorealized{
    id:number,
    status:string
}