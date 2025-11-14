import { Component,Input, Output,EventEmitter, inject, Inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';





@Component({
  selector: 'app-form-bautizo',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-bautizo.html',
  styleUrl: './form-bautizo.css'
})
export class FormBautizo {
  
  @Output() formdata=new EventEmitter<any>();
  @Output() steps=new EventEmitter<boolean>();
  eventService=inject(Eventos)


  form:FormGroup;

 

  constructor(private frm:FormBuilder){
    this.form=frm.group({
      nombres: ['',Validators.required],
      apellido_pat:['',Validators.required],
      apellido_mat:[''],
      genero:['',Validators.required],
      fecha_nac:['',Validators.required],
      edad:['',Validators.required],
      tipo:['',Validators.required]
    })
  }


  ngOnInit(){
    const savedata=this.eventService.getCelebrado_form()
    if (savedata){
      this.form.patchValue(savedata)

      const tipo=this.eventService.getTipoEvento()
      this.form.patchValue({
        tipo: tipo
      });
    }
    
  }

  next(){
    this.steps.emit(true);
    this.eventService.saveTipoEvento(this.form.value["tipo"])
    const celebradoData = {
      ...this.form.value
    };
    this.eventService.saveCelebradoform(celebradoData, 0)
    
  }
}
