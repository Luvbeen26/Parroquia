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
import { CardsDayEvents, GetMonthEvents } from '../../../../../models/event';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-eventosadmin',
  imports: [CommonModule,CalendarMonthViewComponent,CalendarPreviousViewDirective,CalendarNextViewDirective,
    CalendarTodayDirective,MatIconModule,CardAdminevents
  ],
  providers: [{provide: DateAdapter, useFactory:adapterFactory},CalendarUtils,CalendarA11y,CalendarDateFormatter,
    CalendarEventTitleFormatter],
  templateUrl: './eventosadmin.html',
  styleUrl: './eventosadmin.css'
})
export class Eventosadmin {
  eventService=inject(Eventos);
  viewDate:Date=new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  searchText=""
  

  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

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
  }


  CargarEventosCalendar(year: number, month: number) {
    this.eventService.GetEventsMonth(year, month).subscribe(res => {
      const eventos = res.map(e => ({
        start: new Date(`${e.fecha_inicio}T${e.hora_inicio}`),
        end: new Date(`${e.fecha_fin}T${e.hora_fin}`),
        title: `${e.tipo} - ${e.descripcion ?? e.nombre_c}`,
        color: this.eventColors[e.tipo] ?? { primary: '#000', secondary: '#ccc' },
        meta:{
          name:e.nombre_c,
          id:e.id_evento,
          status:e.status,
          tipo:e.tipo,
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
      nombre_c:e.meta.name,
      fecha_inicio:`${e.start.getHours().toString().padStart(2, '0')}:${e.start.getMinutes().toString().padStart(2, '0')}`,
      tipo:e.meta.tipo,
      status:e.meta.status,
      evidencia:e.meta.evidencia
    }))

    this.dayeventsSubject.next(eventos);
    console.log(this.dayeventsSubject)
  }
}