export interface document{
    tipo:string;
    archivo:File;    
}

export interface get_user_docs{
    descripcion:string,
    status:string
}

export interface docs_event extends get_user_docs{
    id_documento:number,
    motivo:string
}