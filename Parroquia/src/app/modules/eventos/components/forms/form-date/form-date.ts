import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  
  form:FormGroup;
  @Output() steps=new EventEmitter<boolean>();

    
    
  

  constructor(private frm:FormBuilder){
    this.minday = new Date(this.today);
    this.minday.setDate(this.today.getDate() + 3); // día siguiente
    this.isomin = this.minday.toISOString().split('T')[0]; // YYYY-MM-DD
  
    this.form=frm.group({
      fecha: ['',Validators.required],
      hora:['',Validators.required]
    })
    
  }

  DateChange(event:Event){
    const selected=(event.target as any).value;
    const date_input=document.getElementById("date") as HTMLInputElement
    date_input.value=selected

    console.log(selected)
  }
 
  next(){
    this.steps.emit(true);
  }

  prev(){
    this.steps.emit(false);
    
  }
}
