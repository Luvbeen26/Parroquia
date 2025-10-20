import { Component, ElementRef, ViewChild } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';

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
  


  constructor() {
    this.minday = new Date(this.today);
    this.minday.setDate(this.today.getDate() + 3); // día siguiente
    this.isomin = this.minday.toISOString().split('T')[0]; // YYYY-MM-DD
  
    
    
  }

  DateChange(event:Event){
    const selected=(event.target as any).value;
    console.log(selected)
  }
 
}
