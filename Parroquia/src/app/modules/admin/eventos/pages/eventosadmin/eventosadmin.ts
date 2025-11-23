import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarMonthViewComponent, CalendarEvent,CalendarView,DateAdapter,CalendarPreviousViewDirective,CalendarNextViewDirective,
CalendarTodayDirective,CalendarUtils,CalendarA11y,
CalendarDateFormatter,
CalendarEventTitleFormatter} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatIconModule } from '@angular/material/icon';
import { CardAdminevents } from '../../components/card-adminevents/card-adminevents';
import { Eventos } from '../../../../../services/eventos';
import { CardsDayEvents, GetEventsReagendar, GetMonthEvents } from '../../../../../models/event';
import { BehaviorSubject } from 'rxjs';
import { Modalcomponent } from '../../../../../shared/modalcomponent/modalcomponent';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-eventosadmin',
  imports: [CommonModule,CalendarMonthViewComponent,CalendarPreviousViewDirective,CalendarNextViewDirective,
    CalendarTodayDirective,MatIconModule,CardAdminevents,Modalcomponent,RouterLink
  ],
  providers: [{provide: DateAdapter, useFactory:adapterFactory},CalendarUtils,CalendarA11y,CalendarDateFormatter,
    CalendarEventTitleFormatter],
  templateUrl: './eventosadmin.html',
  styleUrl: './eventosadmin.css'
})
export class Eventosadmin {
  router=inject(Router)
  eventService=inject(Eventos);
  toast=inject(ToastrService)
  viewDate:Date=new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  titleModal=""
  searchText=""

  isModalOpen=signal(false);
  operation=signal<string>("")
  archivoSeleccionado: File | null = null;
  filename: string | null = null;
  id_eventSelected:number | null = null
  currentSelectedDate: Date | null = null;
  evidenciaUrl: string | null = null;

  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  private eventsReagendSubject = new BehaviorSubject<GetEventsReagendar[]>([]);
  eventsReagend$ = this.eventsReagendSubject.asObservable();

  
  private dayeventsSubject = new BehaviorSubject<CardsDayEvents[]>([]);
  dayevents$=this.dayeventsSubject.asObservable();

  private eventColors:any= {
    'Bautizo': { primary: '#6366f1', secondary: '#E0E7FF' },
    'Confirmación': { primary: '#1F734F', secondary: '#D1FAE5' },
    'Primera Comunión': { primary: '#742FD3', secondary: '#F3E8FF' },
    'Matrimonio': { primary: '#EF4444', secondary: '#FEE2E2' },
    'XV Años': { primary: '#EC4899', secondary: '#FCE7F3' },
    'Parroquial': { primary: '#F59E0B', secondary: '#FEF3C7' }
  };
    
  

  ngOnInit(){
    this.CargarEventosCalendar(this.viewDate.getFullYear(),this.viewDate.getMonth()+1)

    this.eventService.GetEventsReagendar().subscribe(res=>{
      console.log(res)
      console.log(1)
      const evento=res.map(e =>({
        nombre_c: e.nombre_c,
        descripcion: e.descripcion,
        id_evento: e.id_evento,
        tipo: e.tipo,       
        status: e.status,
        folio:e.folio
      }));
      this.eventsReagendSubject.next(evento);
      console.log(this.eventsReagendSubject)
    })
  }


  CargarEventosCalendar(year: number, month: number) {
    this.eventService.GetEventsMonth(year, month).subscribe(res => {
      const eventos = res.map(e => ({
        start: new Date(`${e.fecha_inicio}T${e.hora_inicio}`),
        end: new Date(`${e.fecha_fin}T${e.hora_fin}`),
        title: `${e.tipo} - ${e.descripcion ?? e.nombre_c}`,
        color: this.eventColors[e.tipo] ?? { primary: '#000', secondary: '#ccc' },
        meta:{
          descripcion:e.descripcion,
          name:e.nombre_c,
          id:e.id_evento,
          status:e.status,
          tipo:e.tipo,
          folio:e.folio,
          evidencia:e.status === 'A' ? e.evidencia : null
        }
      }));
      this.eventsSubject.next(eventos);
    });
  }

  PrevNextMonth(){
    const year=this.viewDate.getFullYear();
    const month=this.viewDate.getMonth()+1;

    this.CargarEventosCalendar(year,month);

  }


  handleEvent(event:CalendarEvent):void{
    console.log("Evento clickeado",event);
  }

  dayClicked({date,events}: {date:Date,events:CalendarEvent[]}):void{
    const eventos=events.map(e =>({
      id_evento:e.meta.id,
      nombre_c: e.meta.name ?? e.meta.descripcion,
      fecha_inicio:`${e.start.getHours().toString().padStart(2, '0')}:${e.start.getMinutes().toString().padStart(2, '0')}`,
      fecha_fin:`${e.end?.getHours().toString().padStart(2, '0')}:${e.end?.getMinutes().toString().padStart(2, '0')}`,
      tipo:e.meta.tipo,
      status:e.meta.status,
      folio:e.meta.folio,
      evidencia:e.meta.evidencia
    }))
    
    this.dayeventsSubject.next(eventos);
    
  }

  closeModal() {
    this.isModalOpen.set(false)
    this.operation.set('');
    this.filename = null;
    this.archivoSeleccionado = null;
    this.id_eventSelected=null;
    this.evidenciaUrl = null; 

  }

  openModal(data: {operation: string, id: number}) {
    this.operation.set(data.operation);
    this.id_eventSelected=data.id
    this.isModalOpen.set(true);
    
    if(this.operation() == "check"){
      this.titleModal="Marcar Asistencia de Evento"
    }
    else if(this.operation() == "ver_evidencia") {
      this.titleModal = "Evidencia de Asistencia";
      const evento = this.dayeventsSubject.value.find(e => e.id_evento === data.id);
      if(evento && evento.evidencia) {
        this.evidenciaUrl= evento.evidencia;
      }
    }
  }
  
  onArchivoSelect(event: Event) {
    const inputfile = event.target as HTMLInputElement;

    if (inputfile.files) {
      this.filename = inputfile.files[0].name;
      this.archivoSeleccionado = inputfile.files[0];
    } else {
      this.filename = null;
      this.archivoSeleccionado = null;
    }
  }

  AccionModal(){
    if(this.operation() == "check")
      this.UploadEvidence()
  }

  UploadEvidence() {
    this.eventService.MarkasRealized(this.id_eventSelected!,this.archivoSeleccionado!).subscribe({
      next: res=> {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
        this.toast.success("Evento marcado como asistido")
      },
      error: err=> this.toast.error("Error al cambiar estado")
    });
    
    this.closeModal();
  }
}