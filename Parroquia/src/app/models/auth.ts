import { Login } from "../modules/auth/components/pages/login/login";

export interface UserData{
    id_usuario:number,
    correo:string,
    es_admin:boolean,
    nombre:string,
    exp:number
}


export interface RegisterUser{
    nombres: string;
    apellidos: string;
    correo: string;
    contra: string;
    confirm_pswd: string;
    code: number;
}

export interface LoginUser{
    correo:string;
    contra:string;
}


export interface ChangePassword extends LoginUser{
    code:string;
}

export interface ChangePasswordOnSession{
    password: string;
    old_password: string;
}

export interface Get_email{
    correo:string;
}

export interface AuthTokens{
    access_token:string;
    refresh_token:string;
}

export interface Send_codeResponse{
    success:boolean;
    message:string;
}