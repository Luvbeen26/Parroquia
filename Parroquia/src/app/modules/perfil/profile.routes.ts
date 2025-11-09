import { Routes } from "@angular/router";
import { PerfilContenedor } from "./pages/perfil-contenedor/perfil-contenedor";
import { ReUploadDoc } from "./pages/re-upload-doc/re-upload-doc";


export const PROFILE_ROUTE:Routes=[
    {path:'',component:PerfilContenedor},
    {path:'reuploadDocuments/:id',component:ReUploadDoc}
]