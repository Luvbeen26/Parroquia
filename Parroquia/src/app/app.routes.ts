import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Login } from './modules/login/login';
import { Home } from './modules/home/home';

export const routes: Routes = [
    {path: '', component:Home},
    {path: 'login',component:Login},
    {path: '**',redirectTo:''}

];
