import { Routes } from "@angular/router";
import { Login } from "./components/pages/login/login";
import { Register } from "./components/pages/register/register";
import { RestorePassword } from "./components/pages/restore-password/restore-password";

export const AUTH_ROUTES:Routes=[
    {path: 'login',component:Login},
    {path: 'register',component:Register},
    {path: 'restore',component:RestorePassword}
]