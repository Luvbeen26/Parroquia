import { Component } from '@angular/core';
import { HomeEventCards } from "../../shared/home-event-cards/home-event-cards";
import { Publications } from '../../shared/publications/publications';

@Component({
  selector: 'app-home',
  imports: [HomeEventCards,Publications],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  eventList = [
    { evento: 'Misa Dominical', date: 'Miercoles 12 de Diciembre de 2025', hour: '13:00 - 14:00' },
    { evento: 'Kermes', date: 'Miercoles 12 de Diciembre de 2025', hour: '11:00 - 15:00' },
    { evento: 'Kermes', date: 'Miercoles 12 de Diciembre de 2025', hour: '11:00 - 15:00' },
    { evento: 'Misa Dominical', date: 'Miercoles 12 de Diciembre de 2025', hour: '13:00 - 14:00' },
    { evento: 'Kermes', date: 'Miercoles 12 de Diciembre de 2025', hour: '11:00 - 15:00' }
  ];

  publicList = [
    { titulo: 'Misa Dominical - Horarios Actualizados',date:'11 de Nov. de 2025', img:'img/image_26.png',contenido:'Les informamos sobre los nuevos horarios de misas dominicales a partir de este mes. Estaremos celebrando a las 8:00 AM, 10:00 AM y 6:00 PM.'},
    { titulo: 'Proximos Eventos',date:'11 de Nov. de 2025', img:'../img/image_20.png',contenido:'Divierte ayudando en esta gran Kermes de la Parroquia Nuestra Señora del Rosario donde además contará con un gran elenco musical.'},
     { titulo: 'Proximos Eventos',date:'11 de Nov. de 2025', img:'',contenido:'Divierte ayudando en esta gran Kermes de la Parroquia Nuestra Señora del Rosario donde además contará con un gran elenco musical.'}
  ];
}
