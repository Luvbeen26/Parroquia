import { Component, inject } from '@angular/core';

import { docs_event, get_user_docs } from '../../../../models/document';
import { Router, RouterEvent } from '@angular/router';
import { CardRejected } from '../../components/card-rejected/card-rejected';
import { ActivatedRoute } from '@angular/router';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { catchError, Observable, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { nextTick } from 'process';
import { response } from 'express';
import { Profile } from '../../../../services/profile';

@Component({
  selector: 'app-re-upload-doc',
  imports: [CardRejected,MatIcon,CommonModule],
  templateUrl: './re-upload-doc.html',
  styleUrl: './re-upload-doc.css'
})
export class ReUploadDoc {
  prof=inject(Profile)
  router=inject(ActivatedRoute)
  rout=inject(Router)
  rejected$!:Observable <docs_event[]>
  eventoId:number
  fileinputs:File[]=[];
  ids_docs!:string

  constructor(){
      this.eventoId = Number(this.router.snapshot.paramMap.get('id'));
  }



  ngOnInit(){
    this.rejected$=this.prof.GetRejectedDocs(this.eventoId).pipe(
      tap((r) => {
        this.ids_docs=r.map(item => item.id_documento).join(',');

      }),
      catchError((error) =>{
        if(error.status == 401){
          this.rout.navigate(["/"]);
        }

        
        return of([]);
      })
    )
  }

  SaveFile(file:File,index:number){
    this.fileinputs[index]=file;
    
  }

  ValidateAllInputs():boolean{
    return this.fileinputs.length > 0 && this.fileinputs.every(f => f != null);
  }

  UpdateDocs(){
    this.prof.UpdateDocs(this.ids_docs,this.fileinputs).subscribe({
      next: (response) =>{
        console.log(response)
        this.rout.navigate(["/profile"])
      },
      error: (err) =>{
        console.log(err)
      }
    });
  }
}
