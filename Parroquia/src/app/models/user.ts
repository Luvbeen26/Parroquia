

export interface Notif{
    id:number,
    mensaje:string,
    fecha:string,
    leido:boolean,
    tipo:string
}

export interface ChangeInfo{
    nombres:string;
    apellidos:string;
}

export interface Userbase extends ChangeInfo{
    correo:string;
    es_admin?:boolean;
}

export interface Change_password{
    new_password:string;
    actual_password:string;
}