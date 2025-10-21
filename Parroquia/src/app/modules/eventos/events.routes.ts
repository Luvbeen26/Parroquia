import { Routes } from "@angular/router";
import { Eventos } from "./pages/evento/eventos";
import { Bautizo } from "./pages/bautizo/bautizo";

export const EVENT_ROUTES:Routes=[
    {path: 'ver',component:Eventos},
    {path: 'prog/bautizo',component:Bautizo},

]