import { get_user_docs } from "./document"

export interface parroquial{
    descripcion:string,
    fecha:string,
    hora_inicio:string,
    hora_fin:string
}

export interface Parents{
    id_evento_participante?: number;
    nombres: string,
    apellido_pat: string,
    apellido_mat: string,
    id_rol:number
}

export interface Celebrate{
    id_celebrado?: number;
    nombres: string,
    apellido_pat: string,
    apellido_mat: string,
    id_rol?:number,
    genero: string,
    fecha_nac: string, 
    edad: number
    //tipo: number
}

export interface PendientProcessClient{
    id_evento:number,
    tipo:string,
    id_tipo:number,
    status:string,
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

export interface GetEventsReagendar{
    nombre_c: string,
    descripcion: string | null,
    id_evento: number,
    tipo: string,    
    folio:string,   
    status: string,
}

export interface GetMonthEvents extends GetEventsReagendar{
    
    fecha_inicio: string,
    hora_inicio: string,    
    fecha_fin: string,    
    hora_fin: string,      
    evidencia: string | null,
}



export interface CardsDayEvents{
    folio:string,   
    id_evento:number;
    nombre_c:string,
    fecha_inicio:string,
    fecha_fin:string,
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

export interface ParroquialEvent{
    descripcion:string,
    fecha_inicio:string,
    fecha_fin:string
}

export interface GetAParroquialEvent extends ParroquialEvent{
    id_evento:number
}


export interface CelebradoDetalle {
    id_celebrado: number;
    nombres: string;
    apellido_pat: string;
    apellido_mat: string;
    id_rol: number;
    fecha_nacimiento: string;
    genero: string;
    edad: number;
    id_evento: number;
}


export interface ParticipanteDetalle {
    id_evento_participante: number;
    nombres: string;
    apellido_pat: string;
    apellido_mat: string;
    id_rol: number;
    id_evento: number;
}

export interface GetALLAEvent {
    id_evento: number;
    id_usuario: number;
    fecha_hora_inicio: string;
    fecha_hora_fin: string;
    id_tipo_evento: number;
    folio: string;
    status: string;
    descripcion: string | null;
    evidencia: string | null;
    reagendar: number | null;
    celebrados:CelebradoDetalle[], //añadir id_celebrado
    evento_participante:ParticipanteDetalle[]
}