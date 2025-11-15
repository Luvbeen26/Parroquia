import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

import { catchError, switchMap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';



export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService=inject(Auth)
  const platformId=inject(PLATFORM_ID)

  if(!isPlatformBrowser(platformId)){
    return next(req);
  }

  const Authurl=req.url.includes('/auth/login') ||
                req.url.includes('/auth/register') ||
                req.url.includes('/auth/restore');

  if(Authurl){
    return next(req);
  }

  const token=authService.getAccessToken();

  if(token){
    req=req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return next(req).pipe(
    catchError((error) =>{
      if(error.status === 401){
        return authService.refresh().pipe(
          switchMap((newToken) =>{
            const cloneReq=req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(cloneReq);
          }),
          catchError((error) =>{
            authService.logout()
            return throwError(() => error)
          })
        );
      }

      return throwError(() => error)
    })
  )

};