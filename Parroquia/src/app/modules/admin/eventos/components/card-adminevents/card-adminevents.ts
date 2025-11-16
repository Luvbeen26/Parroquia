import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CardsDayEvents } from '../../../../../models/event';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-adminevents',
  imports: [MatIconModule,MatTooltipModule,CommonModule],
  templateUrl: './card-adminevents.html',
  styleUrl: './card-adminevents.css'
})
export class CardAdminevents {
  @Input() eventObj!:CardsDayEvents;
  @Output() abrir = new EventEmitter<{operation: string, id: number}>(); // Cambia el tipo
  

  AbrirModal(operation: string) {
    console.log(operation);
    this.abrir.emit({operation:operation,id:this.eventObj.id_evento}); // Emite la operación directamente
  }
}
