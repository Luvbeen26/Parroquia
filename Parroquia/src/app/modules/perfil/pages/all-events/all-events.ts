import { Component } from '@angular/core';
import { CardEvents } from '../../components/card-events/card-events';
import { getEventInfo } from '../../../../models/event';

@Component({
  selector: 'app-all-events',
  imports: [CardEvents],
  templateUrl: './all-events.html',
  styleUrl: './all-events.css'
})
export class AllEvents {

  events:getEventInfo[]=[]

  ngOnInit(){
    
  }
}
