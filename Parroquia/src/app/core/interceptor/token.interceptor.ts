import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

import { catchError, switchMap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';



export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId=inject(PLATFORM_ID)

  if(!isPlatformBrowser(platformId)){
    return next(req);
  }

  const auth=inject(Auth);
  const token=auth.getAccessToken();
  
  
  if(token){
    req=req.clone({ //la peticion clonada si se encuentra un token
      setHeaders:{
        Authorization:`Bearer ${token}`
      }
    });
  }


  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && auth.getRefreshToken()) { //si el access no es valido o expiro
        return auth.refresh().pipe(
          switchMap(newToken =>{
            const newReq=req.clone({
                setHeaders: {Authorization: `Bearer ${newToken}`}
            });
            return next(newReq);
          }), catchError(err => {
            auth.logout();
            return throwError(() => err);
          })
        );
        
      }
      return throwError(() => error);
    })
  );
};