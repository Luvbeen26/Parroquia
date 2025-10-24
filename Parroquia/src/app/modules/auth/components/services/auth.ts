import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { AuthTokens, LoginUser, RegisterUser, Send_codeResponse } from '../../../../models/auth';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiurl='http://localhost:8000/auth';
  
  /*
  cookies=inject(CookieService)
  http=inject(HttpClient)
  router=inject(Router)
  */
  constructor(private http:HttpClient,private router:Router,public cookies:CookieService){}

  public login(correo:string, contra:string): Observable<AuthTokens>{
    const body: LoginUser={ correo,contra };
    return this.http.post<AuthTokens>(`${this.apiurl}/login`,body).pipe(
      tap(response=>{
        this.cookies.set('access_token',response.access_token,1/96);
        this.cookies.set('refresh_token',response.refresh_token,7);
      })
    );
  }

  public send_code(correo:string): Observable<Send_codeResponse>{
    return this.http.post<Send_codeResponse>(`${this.apiurl}/send_code`,{correo});
  }

  public register(nombres:string,apellidos:string,correo:string,contra:string,confirm_pswd:string,code:number): Observable<AuthTokens>{
    const body: RegisterUser={nombres,apellidos,correo,contra,confirm_pswd,code};
    return this.http.post<AuthTokens>(`${this.apiurl}/create_user`,body);
  }

  public getAccessToken():string{
    return this.cookies.get('access_token')
  }
  
  public getRefreshToken():string{
    return this.cookies.get('refresh_token')
  }

  public logout(){
    this.cookies.delete('access_token');
    this.cookies.delete('refresh_token');
    this.router.navigate(['/']);
  }

  public refresh(){
    const refresh_token=this.getRefreshToken();
    if(!refresh_token){
      this.logout();
      return throwError(() => new Error('Refresh token invalido'))
    }

    return this.http.post<{access_token:string}>(`${this.apiurl}/refresh`,{token:refresh_token}).pipe(
      //Se establece el nuevo access token en la cookie
      tap(response =>{
        this.cookies.set('access_token',response.access_token,1/96);
      }),
      //quita peticiones(observables) anteriores para realizar otra nueva
      //agarra el nuevo access token del json para devolverlo al interceptor
      switchMap(response=>{
        return new Observable<string>(observer =>{
          observer.next(response.access_token);
          observer.complete();
        });
      }), catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }
}
