import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { DocumentUpload } from '../../document-upload/document-upload';
import { Event } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { take } from 'rxjs';
import { Eventos } from '../../../../../services/eventos';

@Component({
  selector: 'app-form-documents',
  imports: [HeaderForm,DocumentUpload],
  templateUrl: './form-documents.html',
  styleUrl: './form-documents.css'
})
export class FormDocuments {
  eventService=inject(Eventos)
  @Input() id_event!:number;

  @Output() archivos=new EventEmitter<File[]>();
  @Output() steps=new EventEmitter<boolean>();
  //NOMBRES DE ARCHIVOS
  fileList:string[]=[]
  //INPUTS DEL FORMULARIO FILE
  fileinputs:File[]=[];

  ngOnInit(){
    //AGARRA LOS NOMBRES DE LOS ARCHIVOS
    const take_events=this.eventService.sendDocumentArray(this.id_event)
    //DA LOS NOMBRES DE LOS ARCHIVOS
    this.fileList=take_events

    this.fileinputs=new Array(this.fileList.length).fill(null);

    if (this.fileList.length > 0) {
      this.fileinputs=this.eventService.getFilesForm();
    } 

    const val=this.ValidateAllInputs()
    console.log(this.fileList)
    console.log(this.fileinputs)
    

  }

  ValidateAllInputs():boolean{
    return this.fileinputs.length > 0 && this.fileinputs.every(f => f != null);
  }

  next(){
    this.steps.emit(true);
    this.SaveFileService(this.fileinputs)
    
  }

  prev(){
    this.steps.emit(false);
    this.SaveFileService(this.fileinputs)
  }

  SaveFile(file:File,index:number){
    this.fileinputs[index]=file;
  }
  
  SaveFileService(file:File[]){
    this.eventService.saveFilesForm(file)
  }
}
