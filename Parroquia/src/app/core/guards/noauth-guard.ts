import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../modules/auth/components/services/auth';

export const noauthGuard: CanActivateFn = (route, state) => {
const platformId=inject(PLATFORM_ID)

  if(!platformId)
    return true
  
  const authService=inject(Auth)
  const router=inject(Router)

  const isAuth=authService.isAuthenticated();

  if(!isAuth){
    return true;
  }
  

  router.navigate(["/"])
  return false;
  
};
