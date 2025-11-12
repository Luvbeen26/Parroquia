import { Component, inject } from '@angular/core';
import { PendientProcessClient } from '../../../../models/event';

import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { EventUser } from '../../components/event-user/event-user';

import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Profile } from '../../../../services/profile';


@Component({
  selector: 'app-pendient-process',
  imports: [EventUser,MatIcon,CommonModule],
  templateUrl: './pendient-process.html',
  styleUrl: './pendient-process.css'
})
export class PendientProcess {
  //Descripcion
  //id
  //cada uno de los documentos
  Process$!:Observable <PendientProcessClient[]>

  profileService=inject(Profile)
  ngOnInit(){
    this.Process$ = this.profileService.GetPendientEventsUser();
  }

}
