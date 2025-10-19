import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthTokens, LoginUser, RegisterUser, Send_codeResponse } from '../../../../models/auth';
import { BoundElementProperty } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiurl='http://localhost:8000/auth';
  
  constructor(private http:HttpClient){}

  public login(correo:string, contra:string): Observable<AuthTokens>{
    const body: LoginUser ={ correo,contra };
    return this.http.post<AuthTokens>(`${this.apiurl}/login`,body);
  }

  public send_code(correo:string): Observable<Send_codeResponse>{
    return this.http.post<Send_codeResponse>(`${this.apiurl}/send_code`,{correo});
  }

  public register(nombres:string,apellidos:string,correo:string,contra:string,confirm_pswd:string,code:number): Observable<AuthTokens>{
    const body: RegisterUser={nombres,apellidos,correo,contra,confirm_pswd,code};
    return this.http.post<AuthTokens>(`${this.apiurl}/create_user`,body);
  }
}
