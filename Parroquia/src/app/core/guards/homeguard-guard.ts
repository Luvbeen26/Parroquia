import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export const homeguardGuard: CanActivateFn = (route, state) => {
  const platformId=inject(PLATFORM_ID)

  if(!platformId)
    return true
  
  const authService=inject(Auth)
  const router=inject(Router)

  const isAuth=authService.isAuthenticated();
  const es_admin=authService.get_userRol();

  if(!isAuth || !es_admin){
    return true;
  }
  
  

  router.navigate(["/admin"])
  return false;
  
};
