import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Login } from './modules/auth/components/pages/login/login';

import { Register } from './modules/auth/components/pages/register/register';
import { RestorePassword } from './modules/auth/components/pages/restore-password/restore-password';
import { Eventos } from './modules/eventos/pages/evento/eventos';
import { Home } from './modules/home/pages/home/home';
import { Bautizo } from './modules/eventos/pages/bautizo/bautizo';


export const routes: Routes = [
    {path: '', component:Home},
    {path: 'eventos',component:Eventos},
    {path: 'login',component:Login},
    {path: 'register',component:Register},
    {path: 'restore',component:RestorePassword},
    {path: 'form/prog/bautizo',component:Bautizo},
    {path: '**',redirectTo:''}

];
