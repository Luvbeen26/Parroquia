import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Eventos } from '../../../../../services/eventos';



@Component({
  selector: 'app-form-con-prim',
  imports: [HeaderForm,ReactiveFormsModule,MatIconModule],
  templateUrl: './form-con-prim.html',
  styleUrl: './form-con-prim.css'
})
export class FormConPrim {
  eventService=inject(Eventos)
  
  @Input() id_event!:number;
  @Input() formgroup!: any;
  @Output() formdata=new EventEmitter<any>();
  @Output() steps=new EventEmitter<boolean>();
  
  eventName!:string;
  form:FormGroup;
  icon!:string
 

  constructor(private frm:FormBuilder){
    this.form=frm.group({
      nombres: ['',Validators.required],
      ap_pat:['',Validators.required],
      ap_mat:['',Validators.required],
      genero:['',Validators.required],
      fecha_nac:['',Validators.required],
      edad:['',Validators.required],
      tipo:[this.id_event],
    })
  }


  ngOnInit(){
    this.eventName= this.id_event == 3 ? "Comulgante" : "Confirmado";
    this.icon=this.id_event == 3 ? "../icons/sacramentos/cross.svg" : "../icons/sacramentos/confirmacion.svg";
    const savedata=this.eventService.getCelebrado_form()

    console.log(savedata)
    if (savedata){
      this.form.patchValue(savedata)
    }
  }

  next(){
    this.steps.emit(true);
    console.log(this.form.value)
    this.eventService.saveCelebradoform(this.form.value,0)
  }

  
}
