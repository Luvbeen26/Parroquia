import { Routes } from '@angular/router';
import { Home } from './modules/home/pages/home/home';



export const routes: Routes = [
    {path: '',loadComponent:()=> import('./layouts/user-layout/user-layout').then(m=>m.UserLayout),
            children:[
                {path:'',loadChildren:()=> import('./modules/home/home.routes').then(m=>m.HOME_ROUTE)},
                {path:'eventos',loadChildren:()=>import('./modules/eventos/events.routes').then(m=>m.EVENT_ROUTES)},
                {path:'auth',loadChildren:()=> import('./modules/auth/auth.routes').then(m=>m.AUTH_ROUTES)}
            ]
            
    },
    {path: '**',redirectTo:''}

];
