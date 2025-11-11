import { Routes } from "@angular/router";
import { Eventos } from "./pages/evento/eventos";
import { CreateEvent } from "./pages/create-event/create-event";

export const EVENT_ROUTES:Routes=[
    {path: 'ver',component:Eventos},
    {path: 'create_event/:id',component:CreateEvent}
//    {path: 'prog/bautizo',component:Bautizo},

]