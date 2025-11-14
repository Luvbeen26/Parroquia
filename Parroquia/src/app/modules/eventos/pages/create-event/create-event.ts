import { Component, inject } from '@angular/core';

import { FormBautizo } from '../../components/forms/form-bautizo/form-bautizo';
import { FormPadres } from '../../components/forms/form-padres/form-padres';
import { FormDocuments } from '../../components/forms/form-documents/form-documents';
import { FormDate } from '../../components/forms/form-date/form-date';
import { FormPay } from '../../components/forms/form-pay/form-pay';
import { ActivatedRoute } from '@angular/router';
import { FormConPrim } from '../../components/forms/form-con-prim/form-con-prim';
import { FormGroup } from '@angular/forms';
import { Eventos } from '../../../../services/eventos';

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
  //files:string[]=[];
  eventoId!:number
  
  constructor(){
    this.eventoId = Number(this.route.snapshot.paramMap.get('id'));

    //this.files=this.eventService.files_Bautizo;
  }

  ngOnInit(){
    
  }

  

  filesinputs:any[]=[]

  step=0; 
  next_prev_step(next:boolean){
    this.step=(next==true) ? this.step+1 : this.step-1;
  }
 
}
