export interface Userbase{
    nombres:string;
    apellidos:string;
    correo:string;
    es_admin?:boolean;
}

export interface Notif{
    id:number,
    mensaje:string,
    fecha:string,
    leido:boolean,
    tipo:string
}