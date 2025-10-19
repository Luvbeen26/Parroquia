import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-event-info-card',
  imports: [RouterLink],
  templateUrl: './event-info-card.html',
  styleUrl: './event-info-card.css'
})
export class EventInfoCard {
  image=input<string>();
  nombre=input<string>();
  requisitos=input<string[]>();
  impresion=input<number>();
  programar=input<number>();
  linkprog=input<string>();

  
  
}
