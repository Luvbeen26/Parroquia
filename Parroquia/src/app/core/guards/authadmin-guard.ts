import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export const authadminGuard: CanActivateFn = (route, state) => {
  const platformId=inject(PLATFORM_ID)

  if(!platformId)
    return true
  
  const authService=inject(Auth)
  const router=inject(Router)

  const isAuth=authService.isAuthenticated();
  const es_admin=authService.get_userRol();
  

  //es_admin false cliente
  if(!isAuth || !es_admin){
    router.navigate(["/"])
    return false;
  }
  
  return true;
};
