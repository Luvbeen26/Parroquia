import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { PendientProcess } from '../pendient-process/pendient-process';
import { EditProfile } from '../edit-profile/edit-profile';

import { AllEvents } from '../all-events/all-events';
import { Auth } from '../../../../services/auth';




@Component({
  selector: 'app-perfil-contenedor',
  imports: [MatIcon,MatChipsModule,EditProfile,PendientProcess,AllEvents],
  templateUrl: './perfil-contenedor.html',
  styleUrl: './perfil-contenedor.css'
})
export class PerfilContenedor {
  auth=inject(Auth)
  name="Luis Enrique Beerra"
  option!:number

  ngOnInit(){
    this.option=0 
  }


  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0,2)
      .toUpperCase();
  }

  optionMenu(opt:number){
    this.option=opt;
  }

}
