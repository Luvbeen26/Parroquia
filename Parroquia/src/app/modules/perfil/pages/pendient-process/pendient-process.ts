import { Component } from '@angular/core';
import { PendientProcessClient } from '../../../../models/event';

import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { EventUser } from '../../components/event-user/event-user';


@Component({
  selector: 'app-pendient-process',
  imports: [EventUser,MatIcon],
  templateUrl: './pendient-process.html',
  styleUrl: './pendient-process.css'
})
export class PendientProcess {
  //Descripcion
  //id
  //cada uno de los documentos
  Process: PendientProcessClient[] = [
    {
      id_evento: 1,
      descripcion: 'Evento de prueba 1',
      documentos: [
        { descripcion: 'Documento A', status: 'pendiente' },
        { descripcion: 'Documento B', status: 'completo' },
        { descripcion: 'Documento C', status: 'rechazado' },
        { descripcion: 'Documento A', status: 'pendiente' },
        { descripcion: 'Documento B', status: 'completo' },
        { descripcion: 'Documento C', status: 'rechazado' },
        { descripcion: 'Documento A', status: 'pendiente' },
        { descripcion: 'Documento B', status: 'completo' }
      ]
    },
    {
      id_evento: 2,
      descripcion: 'Evento de prueba 2',
      documentos: [
        { descripcion: 'Documento C', status: 'pendiente' }
      ]
    }
  ];
}
