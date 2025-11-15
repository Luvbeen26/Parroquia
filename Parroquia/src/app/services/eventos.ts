import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Celebrate, CreateEvent, DateTime, Parents} from '../models/event';
import { Observable, switchMap, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { document, infoDoc, UploadDoc } from '../models/document';


@Injectable({
  providedIn: 'root'
})
export class Eventos {
  private apiurl=`${environment.apiurl}/event`
  private apiurldocs=`${environment.apiurl}/docs`
  
  private id_tipo_evento:number=0;
    
  public files_Bautizo: infoDoc[] = [
    { nombre: "Acta de nacimiento", id_doc: 1 },
    { nombre: "Copia de la credencial de padrio/madrina", id_doc: 5 },
    { nombre: "Copia de fe de bautismo de los padrino", id_doc: 2 }
  ];

  public files_Conf: infoDoc[] = [
    { nombre: "Acta de nacimiento", id_doc: 1 },
    { nombre: "Copia de la credencial de padrio/madrina", id_doc: 5 },
    { nombre: "Copia de fe de confirmacion de los padrinos", id_doc: 3 }
  ];

  public files_Prim: infoDoc[] = [
    { nombre: "Acta de nacimiento", id_doc: 1 },
    { nombre: "Copia de la credencial de padrio/madrina", id_doc: 5 },
    { nombre: "Copia de fe de primera comunion de los padrinos", id_doc: 4 }
  ];

  public files_Mat: infoDoc[] = [
    { nombre: "Acta de nacimiento del novio", id_doc: 1 },
    { nombre: "Acta de nacimiento de la novia", id_doc: 1 },
    { nombre: "Fe de bautismo del novio", id_doc: 2 },
    { nombre: "Fe de bautismo de la novia", id_doc: 2 },
    { nombre: "Fe de confirmacion del novio", id_doc: 3 },
    { nombre: "Fe de confirmacion de la novia", id_doc: 3 },
    { nombre: "Fe de primera comunion del novio", id_doc: 4 },
    { nombre: "Fe de primera comunion de la novia", id_doc: 4 },
    { nombre: "Copia de la credencial del novio", id_doc: 5 },
    { nombre: "Copia de la credencial de la novia", id_doc: 5 },
    { nombre: "Copia de la credencial de padrino/madrina", id_doc: 5 }
  ];

  public files_XV: infoDoc[] = [
    { nombre: "Acta de nacimiento", id_doc: 1 },
    { nombre: "Fe de bautismo", id_doc: 2 },
    { nombre: "Fe primera comunion", id_doc: 4 },
    { nombre: "Fe de confirmación", id_doc: 3 }
  ];

  private fecha=""
  private hora=""

  

  private prices=[150,350,500,500,2000,0,350];

  public celebrado_form:Celebrate[]=[]
  public parents_form:Parents[]=[];
  public padrinos_form:Parents[]=[]
  private files_form: UploadDoc[] = []

  
  constructor(private http: HttpClient,private cookies:CookieService){}


  saveTipoEvento(id_tipo_evento: number) {
    this.id_tipo_evento = id_tipo_evento;
  }
  
  getTipoEvento(): number {
    return this.id_tipo_evento;
  }

  getPrice(id_event:number){
    return this.prices[id_event-1]
  }

  saveFecha(fecha:string){
    this.fecha=fecha;
  }

  getFecha(){
    return this.fecha
  }

  saveHour(hora:string){
    this.hora=hora
  }

  getHour(){
    return this.hora;
  }

  sendDocumentArray(index:number){
    switch(index){
      case 1:
        return this.files_Bautizo;
        break;
      case 3:
        return this.files_Prim;
      case 4:
        return this.files_Mat
      case 5: 
        return this.files_XV
      case 7:
        return this.files_Conf
      default:  
        return []
    }
  }

  saveFilesForm(docs: UploadDoc[]) {
    this.files_form = docs;
  }

  getFilesForm(): UploadDoc[] {
    return this.files_form;
  }


  saveCelebradoform(celebrado: Celebrate, index: number = 0) {
    let id_rol!:number

    if(this.id_tipo_evento == 1 || this.id_tipo_evento == 2)
      id_rol=1
    else if(this.id_tipo_evento == 3)
      id_rol=6
    //else if(this.id_tipo_evento == 4) //matrimonio
    else if(this.id_tipo_evento == 5)
      id_rol=8
    else if(this.id_tipo_evento == 7)
      id_rol=7

    const celebradoConRol = {
      ...celebrado,
      id_rol: id_rol
    };
    
    if(this.celebrado_form[index]){
      this.celebrado_form[index] = celebradoConRol;
    }else{
      this.celebrado_form.push(celebradoConRol)
    }
  }

  getCelebrado_form(index:number = 0): Celebrate{
    return this.celebrado_form[index];
  }

  saveParentsForm(parent: Parents, rol: 'Parents' | 'Padrinos', index?: number) {
    if (rol === 'Parents') {
      if (index !== undefined && this.parents_form[index]) {
        this.parents_form[index] = { ...parent };
      } else {
        this.parents_form.push({ ...parent });
      }
    } else if (rol === 'Padrinos') {
      if (index !== undefined && this.padrinos_form[index]) {
        this.padrinos_form[index] = { ...parent };
      } else {
        this.padrinos_form.push({ ...parent });
      }
    }
  }

  getParents_form(rol: 'Parents' | 'Padrinos'):Parents[]{
    if(rol === 'Parents'){
      return this.parents_form;
    }else if(rol === 'Padrinos'){
      return this.padrinos_form;
    }
    return []
    
  }

  getHorasAvailable(fecha:string,id_tipo_evento:number):Observable <DateTime>{
    return this.http.get<DateTime>(`${this.apiurl}/horas-disponibles`,{params:{fecha,id_tipo_evento}})
  }


  CreateEvent(): Observable<Object>{
    const fecha_inicio=`${this.fecha} ${this.hora}`;

    const fechaobj=new Date(fecha_inicio);
    fechaobj.setHours(fechaobj.getHours() + 1);

    const nuevaHora = fechaobj.toTimeString().slice(0,8);
    const nuevaFecha = fechaobj.toISOString().split("T")[0];

    const participantes=[...this.parents_form,...this.padrinos_form]
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const body={
      "id_tipo_evento" : this.id_tipo_evento,
      "fecha_inicio" : fecha_inicio,
      "fecha_fin" : `${nuevaFecha} ${nuevaHora}`,
      "celebrado" : this.celebrado_form,
      "participantes" : participantes
    }
    return this.http.post<CreateEvent>(`${this.apiurl}/create/Event`,body,{headers}).pipe(
      switchMap((response: any) =>{
        const formdata=new FormData();
        
        let tipos_docs=this.files_form.map(f => f.id_doc).join(",")
        let id_celebrado:string= response.res.id_celebrados.join(",");
        let id_participante:string=response.res.ids_participantes.join(",")
        

        formdata.append("tipos_docs",tipos_docs)
        formdata.append("id_evento",response.res.evento)
        if (id_participante) formdata.append("id_participante", id_participante);

        formdata.append("id_celebrado",id_celebrado)
        this.files_form.forEach((f: any) => {
          if (f.files && f.files.length > 0) {
            formdata.append("files", f.files[0], f.files[0].name);
          }
        });
        
        console.log(this.files_form)
        console.log(response)
        return this.http.post(`${this.apiurldocs}/upload_file`,formdata,{headers});
      }));
  }
}
