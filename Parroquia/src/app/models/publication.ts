

export interface Imagen{
    id:number,
    ruta:string
}

export interface Publication{
    id:number,
    titulo:string,
    contenido:string,
    fecha_hora:string,
    imagenes?:Imagen[];
}