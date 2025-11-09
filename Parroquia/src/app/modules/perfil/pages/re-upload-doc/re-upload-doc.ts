import { Component, inject } from '@angular/core';
import { Profile } from '../../services/profile';
import { docs_event, get_user_docs } from '../../../../models/document';
import { Router } from '@angular/router';
import { CardRejected } from '../../components/card-rejected/card-rejected';
import { ActivatedRoute } from '@angular/router';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';

@Component({
  selector: 'app-re-upload-doc',
  imports: [CardRejected,MatIcon],
  templateUrl: './re-upload-doc.html',
  styleUrl: './re-upload-doc.css'
})
export class ReUploadDoc {
  prof=inject(Profile)
  router=inject(ActivatedRoute)
  rejected:docs_event[]=[]
  eventoId:Number

  constructor(){
      this.eventoId = Number(this.router.snapshot.paramMap.get('id'));
      this.rejected=[{
        "id_documento": 12,
        "descripcion": "Credencial Padrino",
        "motivo": "Obvio",
        "status": "Rechazado"
      },
      {
        "id_documento": 11,
        "descripcion": "Fe de Bautismo Padrino",
        "motivo": "Si",
        "status": "Rechazado"
      },
      {
        "id_documento": 10,
        "descripcion": "Acta de Nacimiento ",
        "motivo": "Porque si ",
        "status": "Aceptado"
      }]
  }

  ngOnInit(){
    
    
  }
}
