import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard/pages/dashboard/dashboard";
import { Finanzas } from "./finanzas/pages/finanzas/finanzas";
import { Eventosadmin } from "./eventos/pages/eventosadmin/eventosadmin";


export const ADMIN_ROUTES:Routes=[
    {path: '',component:Dashboard},
    {path:'finanzas',component:Finanzas},
    {path: 'eventos',component:Eventosadmin}
]