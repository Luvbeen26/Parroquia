import { Component, input } from '@angular/core';

@Component({
  selector: 'app-event-info-card',
  imports: [],
  templateUrl: './event-info-card.html',
  styleUrl: './event-info-card.css'
})
export class EventInfoCard {
  image=input<string>();
}
