import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CardsDayEvents, GetEventsReagendar } from '../../../../../models/event';
import { CommonModule } from '@angular/common';
import { Eventos } from '../../../../../services/eventos';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-card-adminevents',
  imports: [MatIconModule,MatTooltipModule,CommonModule,RouterLink],
  templateUrl: './card-adminevents.html',
  styleUrl: './card-adminevents.css'
})
export class CardAdminevents {
  router=inject(Router)
  eventService=inject(Eventos)
  toast=inject(ToastrService)
  @Input() eventObj!:CardsDayEvents | GetEventsReagendar;
  @Output() abrir = new EventEmitter<{operation: string, id: number}>(); // Cambia el tipo
  

  isCardsDayEvents(obj: CardsDayEvents | GetEventsReagendar): obj is CardsDayEvents {
    return 'fecha_inicio' in obj;
  }

  get fechaFinDisplay(): string {
    if ('fecha_fin' in this.eventObj && this.eventObj.fecha_fin) {
      return this.eventObj.fecha_fin;
    }
    return 'N/A';
  }

  get fechaDisplay(): string {
    return this.isCardsDayEvents(this.eventObj) ? this.eventObj.fecha_inicio : 'N/A';
  }

  get tieneEvidencia(): boolean {
    return this.isCardsDayEvents(this.eventObj) && this.eventObj.evidencia != null;
  }

  AbrirModal(operation: string) {
    console.log(operation);
    this.abrir.emit({operation:operation,id:this.eventObj.id_evento}); // Emite la operación directamente
  }

  ChangeStatusEvent(status:string){
     this.eventService.MarkNoRealized(this.eventObj.id_evento,status).subscribe({
      next: res=> {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
        if(status == "N")
          this.toast.success("Evento marcado como no asistido")
        else if (status=="R")
          this.toast.success("Reagendacion pedida con exito")
      },
      error: err=> this.toast.error("Error al cambiar estado")
    })
  }

  Delete(){
    this.eventService.DeleteParroquial(this.eventObj.id_evento).subscribe({
      next: res=>{
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
        this.toast.success("Evento eliminado con exito")
      },
      error:err=>this.toast.error("Error al eliminar el evento")
    })
    console.log("Eliminar evento")
  }

  MarcarHecho(){
    
  }
}
