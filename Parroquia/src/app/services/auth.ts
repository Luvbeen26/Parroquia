import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, Observable, switchMap, tap, throwError } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { response } from 'express';

import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../environment/environment';
import { AuthTokens, ChangePassword, LoginUser, RegisterUser, Send_codeResponse, UserData } from '../models/auth';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiurl=`${environment.apiurl}/auth`
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  
   constructor(private http: HttpClient, public cookies: CookieService,private router:Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.loadUserFromCookie();
    }
  }

  public login(correo:string, contra:string): Observable<AuthTokens>{
    const body: LoginUser={ correo,contra };
    return this.http.post<AuthTokens>(`${this.apiurl}/login`,body).pipe(
      tap(response=>{

        if(this.isBrowser){
          this.cookies.set('access_token',response.access_token,1/96);
          this.cookies.set('refresh_token',response.refresh_token,7);
        }
        const userdata=this.decodeToken(response.access_token);
        if(userdata){
          this.currentUserSubject.next(userdata);
        }
      })
    );
  }

  public register(nombres:string,apellidos:string,correo:string,contra:string,confirm_pswd:string,code:number): Observable<AuthTokens>{
    const body: RegisterUser={nombres,apellidos,correo,contra,confirm_pswd,code};
    return this.http.post<AuthTokens>(`${this.apiurl}/create_user`,body).pipe(
      tap(response =>{
        if(this.isBrowser){
          this.cookies.set('access_token',response.access_token,1/96);
          this.cookies.set('refresh_token',response.refresh_token,7);
        }
        const userdata=this.decodeToken(response.access_token);
        if(userdata){
          this.currentUserSubject.next(userdata);
        }
      })
    );
  }

  public send_code(correo:string): Observable<Send_codeResponse>{
    return this.http.post<Send_codeResponse>(`${this.apiurl}/send_code`,{correo});
  }

  public restore_password(change:ChangePassword): Observable<Send_codeResponse>{
    return this.http.put<Send_codeResponse>(`${this.apiurl}/restore_password`,{change})
  }

  private decodeToken(token:string): UserData | null{
    try{
      const decode=jwtDecode<UserData>(token);
      return decode;
    }catch(error){
      console.error("Error al decodificar el token",error)
      return null;
    }
  }

  private loadUserFromCookie(){
    const token=this.getAccessToken();
    if(token){
      const userdata=this.decodeToken(token);
      if(userdata){
        this.currentUserSubject.next(userdata);
      }
    }
  }
  
  public getAccessToken():string | null{
    if(!this.isBrowser) 
      return null;
      
    return this.cookies.get('access_token')
  }
  
  public getRefreshToken():string | null{
    if(!this.isBrowser) 
      return null;
    return this.cookies.get('refresh_token')
  }

  public getCurrentUser():UserData | null{
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean{
    if(!this.isBrowser) 
      return false;

    const token=this.getAccessToken();
    if(!token) return false;

    try{
      const decode=jwtDecode<UserData>(token)
      const currentTime=Date.now() / 1000;
      return decode.exp ? decode.exp > currentTime:true;
    }catch{
      return false;
    }
  }

  public get_userRol(): boolean | null{
    if(!this.isBrowser) 
      return null;

    const user=this.getCurrentUser();
    return user ? user.es_admin :null;
  }

  public get_UserName(): string | null{
    if(!this.isBrowser)
      return null

    const user=this.getCurrentUser();
    return user ? user.nombre :null;
  }

  public logout(){
    if(this.isBrowser){
      this.cookies.delete('access_token');
      this.cookies.delete('refresh_token');
      this.currentUserSubject.next(null)
      this.router.navigate(['/']);
    }
  }

  public refresh(): Observable<string>{
    if(!this.isBrowser){
      return throwError(() => new Error('No se puede refrescar token en el servidor'));
    }
    
    const refresh_token=this.getRefreshToken();
    if(!refresh_token){
      this.logout();
      return throwError(() => new Error('Refresh token invalido'))
    }

      return this.http.post<{access_token:string}>(`${this.apiurl}/refresh`,{refresh_token:refresh_token}).pipe(
      //Se establece el nuevo access token en la cookie
      tap(response =>{
        this.cookies.set('access_token',response.access_token,1/96);
        const userdata=this.decodeToken(response.access_token);
        if(userdata){
          this.currentUserSubject.next(userdata);
        }
      }),
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
