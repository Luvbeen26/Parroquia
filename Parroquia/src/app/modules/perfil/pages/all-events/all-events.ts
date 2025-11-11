import { Component, inject } from '@angular/core';
import { CardEvents } from '../../components/card-events/card-events';
import { getEventInfo, ProxPastEventsClient } from '../../../../models/event';
import { MatIconModule } from '@angular/material/icon';
import { map, Observable } from 'rxjs';
import { Profile } from '../../services/profile';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-events',
  imports: [CardEvents,MatIconModule,CommonModule],
  templateUrl: './all-events.html',
  styleUrl: './all-events.css'
})
export class AllEvents {
  profile=inject(Profile)
  events:getEventInfo[]=[]
  activeFilter: 'proximos' | 'pasados' = 'proximos';
  
  proxEvents$!:Observable <getEventInfo[]>
  pastEvents$!:Observable <getEventInfo[]>

  ngOnInit(){
    const allEvents$ = this.profile.GetPendientAndPastEvents(); // tu endpoint de FastAPI

    this.proxEvents$ = allEvents$.pipe(map((res: any) => res.prox));
    this.pastEvents$ = allEvents$.pipe(map((res: any) => res.past));
    
  }



  changeFilter(filter: 'proximos' | 'pasados'): void {
    this.activeFilter = filter;
  }
}
