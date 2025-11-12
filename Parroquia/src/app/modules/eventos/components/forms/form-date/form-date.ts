import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';


@Component({
  selector: 'app-form-date',
  imports: [HeaderForm],
  templateUrl: './form-date.html',
  styleUrl: './form-date.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class FormDate {
  today = new Date();
  minday: Date;
  isomin: string;
  selecteday="";
  form:FormGroup;
  eventService=inject(Eventos)
  @Input() id_event!:number;
  @Output() steps=new EventEmitter<boolean>();

  meses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  hours_available:string[]=[]
  

  constructor(private frm:FormBuilder){
    //RESTRINGIR DIAS PARA SELECCIONAR
    this.minday = new Date(this.today);
    const days=this.id_event==4 ? 90 : 3
    this.minday.setDate(this.today.getDate() + days); // día siguiente
    this.isomin = this.minday.toISOString().split('T')[0]; // YYYY-MM-DD
  

    this.form=frm.group({
      fecha: ['',Validators.required],
      hora:['',Validators.required]
    })
    
  }

  ngOnInit(){
    const fecha_service=this.eventService.getFecha()
    if(fecha_service){
      const date_input=document.getElementById("date") as HTMLInputElement
      const fecha_alter=this.transformDate(fecha_service)
      date_input.value=fecha_alter
    }

    const hour_service=this.eventService.getHour();
    console.log(hour_service)
    if(hour_service){
      const hour_input=document.getElementById("hora") as HTMLSelectElement;
      console.log(hour_service)
      hour_input.value=hour_service
    }
  }

  DateChange(event:Event){
    const selected=(event.target as any).value;
    const date_input=document.getElementById("date") as HTMLInputElement
    const fecha=this.transformDate(selected)
    this.getAvailableHours(selected)
    this.selecteday=selected
    date_input.value=fecha

  }
 
  next(){
    this.eventService.saveFecha(this.selecteday);
    this.eventService.saveHour(this.takeHour())
    this.steps.emit(true);
  }

  prev(){
    this.eventService.saveFecha(this.selecteday);
    this.eventService.saveHour(this.takeHour())
    this.steps.emit(false);
    
  }

  transformDate(date:String):string{
    const partes=date.split("-")
    const fecha = `${parseInt(partes[2])} de ${this.meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
    return fecha
  }

  takeHour(){
    const hour_input=document.getElementById("hora") as HTMLSelectElement;
    const hora=hour_input.value;
    console.log(hora)
    return hora
  }

  getAvailableHours(fecha:string){
    console.log(this.id_event)
    this.eventService.getHorasAvailable(fecha,this.id_event).subscribe({
      next: (res) =>{
        console.log(res)
        this.hours_available=res.hrs_disponibles
      },
      error: (err) =>{
        console.log(err)
      }
    })
  }
}
