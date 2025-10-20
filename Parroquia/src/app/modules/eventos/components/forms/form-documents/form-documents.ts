import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { DocumentUpload } from '../../document-upload/document-upload';
import { Event } from '@angular/router';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-documents',
  imports: [HeaderForm,DocumentUpload],
  templateUrl: './form-documents.html',
  styleUrl: './form-documents.css'
})
export class FormDocuments {
  //Listado de archivos que se van a subir
  @Output() archivos=new EventEmitter<File[]>();
  //El que activa el next o prev
  @Output() steps=new EventEmitter<boolean>();
  
  
  @Input() docs: File[] = [];
  //LISTADO DE ARCHIVOS A SUBIR EN EL EVENTO
  @Input() fileList: string[] = [];
  fileinputs:File[]=[];

  ngOnInit(){
    this.fileinputs=new Array(this.fileList.length).fill(null);
    if (this.docs.length > 0) {
      this.fileinputs=this.docs;
    } 
  }

  ValidateAllInputs():boolean{
    return this.fileinputs.every(f => f != null);
  }

  next(){
    this.steps.emit(true);
    this.archivos.emit(this.fileinputs);
  }

  prev(){
    this.steps.emit(false);
    this.archivos.emit(this.fileinputs);
  }

  SaveFile(file:File,index:number){
    this.fileinputs[index]=file;
  }
  
}
