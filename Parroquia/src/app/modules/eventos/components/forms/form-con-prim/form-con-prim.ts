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
      apellido_pat:['',Validators.required],
      apellido_mat:['',Validators.required],
      genero:['',Validators.required],
      fecha_nac:['',Validators.required],
      edad:['',Validators.required]
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

    this.eventService.saveTipoEvento(this.id_event)
    const celebradoData = {
      ...this.form.value
    };
    console.log(celebradoData)
    this.eventService.saveCelebradoform(celebradoData,0)
    
  }

  
  
}
