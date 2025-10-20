import { Component } from '@angular/core';

import { FormPadres } from '../../components/forms/form-padres/form-padres';
import { FormBautizo } from '../../components/forms/form-bautizo/form-bautizo';
import { FormDocuments } from '../../components/forms/form-documents/form-documents';

import { FormPay } from '../../components/forms/form-pay/form-pay';
import { FormDate } from '../../components/forms/form-date/form-date';

@Component({
  selector: 'app-bautizo',
  imports: [FormBautizo,FormPadres,FormDocuments,FormDate,FormPay],
  templateUrl: './bautizo.html',
  styleUrl: './bautizo.css'
})
export class Bautizo {
  

  files:string[]=["Acta de nacimiento del bautizado","Copia de la credencial de padrio/madrina","Copia de fe de bautismo de los padrinos"];
  
  

  //bautizadoform: FormGroup;
  bautizadoform:any[]=[{
      nombres: '',
      ap_pat: '',
      ap_mat: '',
      genero: '',
      fecha_nac: '',
      edad: '',
      tipo: ''}];

  parentsform:any[]=[{
    nombres_f: '',
    ap_pat_f: '',
    ap_mat_f: '',
    nombres_m: '',
    ap_pat_m:'',
    ap_mat_m: '',
    nombres_p:'',
    ap_pat_p: '',
    ap_mat_p: ''
  }];

  filesinputs:any[]=[]

  //PASOS
  step=0; 
  next_prev_step(next:boolean){
    this.step=(next==true) ? this.step+1 : this.step-1;
  }


  updateBautizadoForm(datos:any){
    this.bautizadoform[0]={
      nombres: datos.nombres,
      ap_pat: datos.ap_pat,
      ap_mat: datos.ap_mat,
      genero: datos.genero,
      fecha_nac: datos.fecha_nac,
      edad: datos.edad,
      tipo: datos.tipo
    };

    
  }

  updateParentsForm(datos:any){
    this.parentsform[0]={
      nombres_f: datos.nombres_f,
      ap_pat_f: datos.ap_pat_f,
      ap_mat_f: datos.ap_mat_f,
      nombres_m: datos.nombres_m,
      ap_pat_m:datos.ap_pat_m,
      ap_mat_m: datos.ap_mat_m,
      nombres_p:datos.nombres_p,
      ap_pat_p: datos.ap_pat_p,
      ap_mat_p: datos.ap_mat_p
    };
    
  }
  
  updateDocumentsForm(file:File[]){
    this.filesinputs[0]=file[0];
    this.filesinputs[1]=file[1];
    this.filesinputs[2]=file[2];
  }
 
}
