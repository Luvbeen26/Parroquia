import { Routes } from "@angular/router";
import { Dashboard } from "./dashboard/pages/dashboard/dashboard";
import { Finanzas } from "./finanzas/pages/finanzas/finanzas";
import { Eventosadmin } from "./eventos/pages/eventosadmin/eventosadmin";
import { FormParroquial } from "./eventos/pages/form-parroquial/form-parroquial";
import { Documentos } from "./documentos/pages/documentos/documentos";


export const ADMIN_ROUTES:Routes=[
    {path: '',component:Dashboard},
    {path:'finanzas',component:Finanzas},
    {path:'documentos',component:Documentos},
    {path: 'eventos',component:Eventosadmin},
    {path: 'eventos/parroquial',component:FormParroquial},
    {path: 'eventos/parroquial/:id', component: FormParroquial},

]