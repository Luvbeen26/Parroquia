import { Component, Type, ViewChild,Renderer2, viewChild, ViewContainerRef } from '@angular/core';

import { FormPadres } from '../../components/forms/form-padres/form-padres';
import { FormBautizo } from '../../components/forms/form-bautizo/form-bautizo';
import { FormDocuments } from '../../components/forms/form-documents/form-documents';

import { FormPay } from '../../components/forms/form-pay/form-pay';
import { FormDate } from '../../components/forms/form-date/form-date';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bautizo',
  imports: [FormBautizo,FormPadres,FormDocuments,FormDate,FormPay],
  templateUrl: './bautizo.html',
  styleUrl: './bautizo.css'
})
export class Bautizo {
  

  files:string[]=["Acta de nacimiento del bautizado","Copia de la credencial de padrio/madrina","Copia de fe de bautismo de los padrinos"];
  
  

  //bautizadoform: FormGroup;
  bautizadoform:any[]=[];
  //parentsdrinoform: FormGroup;

/*
  constructor(private formbuild: FormBuilder) {
    this.bautizadoform = this.formbuild.group({
      nombres: [''],
      ap_pat: [''],
      ap_mat: [''],
      genero: [''],
      fecha_nac: [''],
      edad: [''],
      tipo: ['']
    });

    this.parentsdrinoform = this.formbuild.group({
      father: [''],
      mother: [''],
      godfather: ['']
    });
  }
*/


  //PASOS
  step=0; 
  next_prev_step(next:boolean){
    this.step=(next==true) ? this.step+1 : this.step-1;
    console.log(this.step)
  }


  updateBautizadoForm(datos:any){
    console.log(datos);
    this.bautizadoform.push({
      nombres: datos.nombres,
      ap_pat: datos.ap_pat,
      ap_mat: datos.ap_mat,
      genero: datos.genero,
      fecha_nac: datos.fecha_nac,
      edad: datos.edad,
      tipo: datos.tipo
    });

    console.log(this.bautizadoform);
  }

 
}
