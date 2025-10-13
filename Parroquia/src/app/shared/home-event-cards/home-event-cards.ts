import { Component, input } from '@angular/core';

@Component({
  selector: 'app-home-event-cards',
  imports: [],
  templateUrl: './home-event-cards.html',
  styleUrl: './home-event-cards.css'
})
export class HomeEventCards {
  evento=input<string>();
  fecha=input<string>();
  hora=input<string>();
}
