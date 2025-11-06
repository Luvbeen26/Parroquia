import { Component, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-event-info-card',
  imports: [RouterLink],
  templateUrl: './event-info-card.html',
  styleUrl: './event-info-card.css'
})
export class EventInfoCard {
  id=input<number>();
  image=input<string>();
  nombre=input<string>();
  requisitos=input<string[]>();
  programar=input<number>();
  linkprog=input<string>();

  constructor(private router:Router){}

  redirecting(){
    this.router.navigate(['/eventos/create_event', this.id()]);
  }
  
}
