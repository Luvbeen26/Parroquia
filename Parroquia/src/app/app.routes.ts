import { Routes } from '@angular/router';
import { Home } from './modules/home/pages/home/home';
import { authclientGuard } from './core/guards/authclient-guard';
import { noauthGuard } from './core/guards/noauth-guard';
import { PerfilContenedor } from './modules/perfil/pages/perfil-contenedor/perfil-contenedor';
import { ReUploadDoc } from './modules/perfil/pages/re-upload-doc/re-upload-doc';
import { Dashboard } from './modules/dashboard/pages/dashboard/dashboard';
import { authadminGuard } from './core/guards/authadmin-guard';
import { homeguardGuard } from './core/guards/homeguard-guard';



export const routes: Routes = [
    {path: '',loadComponent:()=> import('./layouts/user-layout/user-layout').then(m=>m.UserLayout),
            children:[
                {path:'',canActivate:[homeguardGuard],loadChildren:()=> import('./modules/home/home.routes').then(m=>m.HOME_ROUTE)},
                {path:'eventos',canActivate:[authclientGuard],loadChildren:()=>import('./modules/eventos/events.routes').then(m=>m.EVENT_ROUTES)},
                {path:'auth',canActivate:[noauthGuard],loadChildren:()=> import('./modules/auth/auth.routes').then(m=>m.AUTH_ROUTES)},
                {path:'profile',canActivate:[authclientGuard],loadChildren:()=> import('./modules/perfil/profile.routes').then(m=>m.PROFILE_ROUTE)},
                
            ]
            
    },
    {path:'admin',canActivate:[authadminGuard],canActivateChild:[authadminGuard],loadComponent: ()=> import('./layouts/admin-layout/admin-layout').then(m=>m.AdminLayout),
        children:[
            {path:'',component:Dashboard}
        ]

    },
    {path: '**',redirectTo:''}

];
