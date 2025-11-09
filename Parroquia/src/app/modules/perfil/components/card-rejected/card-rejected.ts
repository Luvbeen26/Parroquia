import { Component, Input } from '@angular/core';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';


@Component({
  selector: 'app-card-rejected',
  imports: [MatIcon],
  templateUrl: './card-rejected.html',
  styleUrl: './card-rejected.css'
})
export class CardRejected {
  @Input() id_docs!:number;
  @Input() motivo!:string;
  @Input() descripcion!:string;
  
}
