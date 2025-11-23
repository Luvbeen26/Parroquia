export interface Imagen{
    id:number,
    ruta:string
}

export interface Publication{
    id_publicacion:number,
    titulo:string,
    contenido:string,
    fecha_hora:string,
    imagenes?:Imagen[];
}

