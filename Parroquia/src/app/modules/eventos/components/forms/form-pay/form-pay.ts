import { Component,input } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';

@Component({
  selector: 'app-form-pay',
  imports: [HeaderForm],
  templateUrl: './form-pay.html',
  styleUrl: './form-pay.css'
})
export class FormPay {
  precio=input(500);
}
