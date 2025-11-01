import { Component, input } from '@angular/core';
import { Imagen } from '../../models/publication';

@Component({
  selector: 'app-publications',
  imports: [],
  templateUrl: './publications.html',
  styleUrl: './publications.css'
})
export class Publications {
  titulo=input<string>();
  date=input<string>();
  image=input<Imagen[]>([]);
  contenido=input<string>();
  


 


} 
