import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiurl='http://localhost:8000/auth';
  
  constructor(private http:HttpClient){}

  public login(correo:string, contra:string): Observable<any>{
    return this.http.post(`${this.apiurl}/login`,{correo,contra});
  }

  public send_code(correo:string): Observable<any>{
    return this.http.post(`${this.apiurl}/send_code`,{correo});
  }

  public register(nombres:string,apellidos:string,correo:string,contra:string,confirm_pswd:string,code:number): Observable<any>{
    return this.http.post(`${this.apiurl}/create_user`,{nombres,apellidos,correo,contra,confirm_pswd,code})
  }
}
