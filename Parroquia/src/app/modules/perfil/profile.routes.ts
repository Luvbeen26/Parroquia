import { Routes } from "@angular/router";
import { PerfilContenedor } from "./pages/perfil-contenedor/perfil-contenedor";
import { ReUploadDoc } from "./pages/re-upload-doc/re-upload-doc";
import { EditEvent } from "./pages/edit-event/edit-event";


export const PROFILE_ROUTE:Routes=[
    {path:'',component:PerfilContenedor},
    {path:'reuploadDocuments/:id',component:ReUploadDoc},
    {path:'editEvent/:id/:tipo/:id_tipo',component:EditEvent},


]