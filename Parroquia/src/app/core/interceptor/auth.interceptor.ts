import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../modules/auth/components/services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth=inject(Auth);
  
  const authRequest = req.clone({
    setHeaders:{
      Authorization: `Bearer`
    }
  })
  
  
  return next(req);
};
