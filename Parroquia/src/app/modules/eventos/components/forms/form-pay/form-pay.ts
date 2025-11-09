import { Component,inject,input } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { Eventos } from '../../../services/eventos';

@Component({
  selector: 'app-form-pay',
  imports: [HeaderForm],
  templateUrl: './form-pay.html',
  styleUrl: './form-pay.css'
})
export class FormPay {
  eventService=inject(Eventos)
  precio=0


  ngOnInit(){
    this.precio=this.eventService.getPrice()
  }
}
