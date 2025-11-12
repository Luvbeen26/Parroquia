import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Celebrate, DateTime, Parents } from '../models/event';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Eventos {
  private apiurl=`${environment.apiurl}/event`
  
  public files_Bautizo:string[]=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de bautismo de los padrino"];
  public files_Conf=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de confirmacion de los padrinos"];
  public files_Prim=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de primera comunion de los padrinos"];
  public files_Mat=["Acta de nacimiento del novio","Acta de nacimiento de la novio","Fe de bautismo del novio","Fe de bautismo del novia",
    "Fe de confirmacion del novio","Fe de confirmacion del novia","Copia de la credencial del novio","Copia de la credencial de la novia","Copia de la credencial de padrino/madrina"]
  public files_XV=["Acta de nacimiento","Fe de bautismo","Fe primera comunion", "Fe de confirmación"]

  public fecha=""
  public hora=""

  public prices=[250,500,1000];

  public celebrado_form:Celebrate[]=[]
  public parents_form:Parents[]=[];
  public padrinos_form:Parents[]=[]
  public files_form:File[]=[]
  
  constructor(private http: HttpClient){}

  getPrice(){
    return this.prices[2]
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

  saveFilesForm(files:File[]){
    this.files_form=files;
  }

  getFilesForm():File[]{
    return this.files_form;
  }


  saveCelebradoform(celebrado:Celebrate,index:number=0){
    if(this.celebrado_form[index]){
      this.celebrado_form[index] = {...celebrado};
    }else{
      this.celebrado_form.push({...celebrado})
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
}
