import { Component, input } from '@angular/core';

@Component({
  selector: 'app-publications',
  imports: [],
  templateUrl: './publications.html',
  styleUrl: './publications.css'
})
export class Publications {
  titulo=input<string>();
  date=input<string>();
  image=input<string>();
  contenido=input<string>();


 


} 
