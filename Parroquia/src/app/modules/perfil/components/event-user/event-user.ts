import { Component, inject, Input } from '@angular/core';
import { get_user_docs } from '../../../../models/document';
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { Profile } from '../../services/profile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-user',
  imports: [CommonModule,MatIcon],
  templateUrl: './event-user.html',
  styleUrl: './event-user.css'
})
export class EventUser {
  @Input() id!:number;
  @Input() descripcion!:string;
  @Input() docs!:get_user_docs[];
  prof=inject(Profile)
  router=inject(Router)

  rejectedFile:get_user_docs[]=[]

  ngOnInit(){
    this.docs.forEach(doc =>{
      if(doc.status == "Rechazado"){
        this.rejectedFile.push(doc)
      }
    })

  }

  ShowRejected(){
    this.router.navigate(["/profile/reuploadDocuments", this.id])
  }
}
