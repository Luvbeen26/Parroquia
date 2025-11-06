import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { Celebrate, Parents } from '../../../models/event';

@Injectable({
  providedIn: 'root'
})
export class Eventos {
  private apiurl=`${environment.apiurl}/events`
  
  public files_Bautizo:string[]=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de bautismo de los padrino"];
  public files_Conf=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de confirmacion de los padrinos"];
  public files_Prim=["Acta de nacimiento","Copia de la credencial de padrio/madrina","Copia de fe de primera comunion de los padrinos"];
  public files_Mat=["Acta de nacimiento del novio","Acta de nacimiento de la novio","Fe de bautismo del novio","Fe de bautismo del novia",
    "Fe de confirmacion del novio","Fe de confirmacion del novia","Copia de la credencial del novio","Copia de la credencial de la novia","Copia de la credencial de padrino/madrina"]
  public files_XV=["Acta de nacimiento","Fe de bautismo","Fe primera comunion", "Fe de confirmación"]

  public prices=[250,500,1000];

  public celebrado_form:Celebrate[]=[]
  public parents_form:Parents[]=[];
  public padrinos_form:Parents[]=[]
  files_form:any[]=[]
  
  constructor(private http: HttpClient){}


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

  public register_event(){
    
  }
}
