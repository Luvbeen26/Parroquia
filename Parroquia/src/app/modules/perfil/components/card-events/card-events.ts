import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-card-events',
  imports: [MatIconModule,CommonModule],
  templateUrl: './card-events.html',
  styleUrl: './card-events.css'
})
export class CardEvents {
  @Input() id!:number;
  @Input() description!:string;
  @Input() event!:string;
  @Input() date!:string;
  @Input() hour!:string;

  ngOnInit(){
    console.log(this.id)
    console.log(this.description)
  }
}
