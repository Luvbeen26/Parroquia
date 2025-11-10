import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-events',
  imports: [],
  templateUrl: './card-events.html',
  styleUrl: './card-events.css'
})
export class CardEvents {
  @Input() id!:number;
  @Input() description!:string;
  @Input() event!:string;
  @Input() date!:string;
  @Input() hour!:string;
}
