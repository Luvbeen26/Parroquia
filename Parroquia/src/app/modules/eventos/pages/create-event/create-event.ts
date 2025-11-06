import { Component, inject } from '@angular/core';
import { Eventos } from '../../services/eventos';
import { FormBautizo } from '../../components/forms/form-bautizo/form-bautizo';
import { FormPadres } from '../../components/forms/form-padres/form-padres';
import { FormDocuments } from '../../components/forms/form-documents/form-documents';
import { FormDate } from '../../components/forms/form-date/form-date';
import { FormPay } from '../../components/forms/form-pay/form-pay';
import { ActivatedRoute } from '@angular/router';
import { FormConPrim } from '../../components/forms/form-con-prim/form-con-prim';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-event',
  imports: [FormBautizo,FormPadres,FormDocuments,FormDate,FormPay,FormConPrim],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})
export class CreateEvent {
  route =inject(ActivatedRoute)
  eventService=inject(Eventos)

  celebrado_form!:FormGroup
  files:string[]=[];
  eventoId!:number
  
  constructor(){
    this.eventoId = Number(this.route.snapshot.paramMap.get('id'));

    this.files=this.eventService.files_Bautizo;
  }

  ngOnInit(){
    
  }

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
