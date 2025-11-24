export interface Imagen{
    id:number,
    ruta:string
}

export interface createPublication{
    titulo:string,
    contenido:string,
    imagenes?:Imagen[];
}


export interface Publication extends createPublication{
    id_publicacion:number,
    fecha_hora:string,
}

