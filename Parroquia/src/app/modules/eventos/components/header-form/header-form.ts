import { Component, Input,input } from '@angular/core';

@Component({
  selector: 'app-header-form',
  imports: [],
  templateUrl: './header-form.html',
  styleUrl: './header-form.css'
})
export class HeaderForm {
  
  titulo=input<string>();
  descripcion=input<string>();
  icono=input<string>();
}
