import { get_user_docs } from "./document"

export interface parroquial{
    descripcion:string,
    fecha:string,
    hora_inicio:string,
    hora_fin:string
}

export interface Parents{
    nombres: string,
    ap_pat: string,
    ap_mat: string
}

export interface Celebrate{
    nombres: string,
    ap_pat: string,
    ap_mat: string,
    genero: string,
    fecha_nac: string, 
    edad: number,
    tipo: number
}

export interface PendientProcessClient{
    id_evento:number,
    descripcion:string,
    documentos:get_user_docs[]
}