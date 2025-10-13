import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Login } from './modules/login/login';
import { Home } from './modules/home/home';
import { Register } from './modules/register/register';
import { RestorePassword } from './modules/restore-password/restore-password';

export const routes: Routes = [
    {path: '', component:Home},
    {path: 'login',component:Login},
    {path: 'register',component:Register},
    {path: 'restore',component:RestorePassword},
    {path: '**',redirectTo:''}

];
