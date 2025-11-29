import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

import { catchError, switchMap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';



export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Excluir rutas de autenticación del interceptor
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/create_user') || 
      req.url.includes('/auth/refresh') ||
      req.url.includes('/auth/send_code') ||
      req.url.includes('/auth/restore_password')) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error : HttpErrorResponse) =>{
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refresh().pipe(
          switchMap((newToken:string) =>{
            const cloneReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(cloneReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(["/"]);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error)
    })
  )

};