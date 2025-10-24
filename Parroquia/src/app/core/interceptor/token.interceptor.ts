import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../modules/auth/components/services/auth';
import { catchError, switchMap, throwError } from 'rxjs';



export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth=inject(Auth);
  const http=inject(HttpClient);

  const token=auth.getAccessToken();

  let authReq=req; //la peticion original
  if(token){
    authReq=req.clone({ //la peticion clonada si se encuentra un token
      setHeaders:{
        Authorization:`Bearer ${token}`
      }
    });
  }


  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) { //si el access no es valido o expiro
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