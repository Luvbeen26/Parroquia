import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { DocumentUpload } from '../../document-upload/document-upload';
import { Event } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { take } from 'rxjs';
import { Eventos } from '../../../../../services/eventos';
import { document, infoDoc, UploadDoc } from '../../../../../models/document';

@Component({
  selector: 'app-form-documents',
  imports: [HeaderForm,DocumentUpload],
  templateUrl: './form-documents.html',
  styleUrl: './form-documents.css'
})
export class FormDocuments {
  eventService = inject(Eventos)
  @Input() id_event!: number;

  @Output() archivos = new EventEmitter<File[]>();
  @Output() steps = new EventEmitter<boolean>();

  fileList: infoDoc[] = []
  
  uploadDocs: UploadDoc[] = [];
  isAllFilesUploaded: boolean = false; 

  ngOnInit() {
    this.fileList = this.eventService.sendDocumentArray(this.id_event);
    
    // Primero crea el array base
    this.uploadDocs = this.fileList.map(doc => ({
      id_doc: doc.id_doc,
      files: []
    }));
    
    // Luego restaura los archivos guardados EN LOS ÍNDICES CORRECTOS
    const savedDocs = this.eventService.getFilesForm();
    if (savedDocs && savedDocs.length > 0) {
      savedDocs.forEach((savedDoc, index) => {
        if (this.uploadDocs[index] && savedDoc.files.length > 0) {
          this.uploadDocs[index].files = savedDoc.files;
        }
      });
    }
    
    this.isAllFilesUploaded = this.ValidateAllInputs();
  }

  ValidateAllInputs(): boolean {
    return this.uploadDocs.length > 0 && 
           this.uploadDocs.every(doc => doc.files.length > 0);
  }

  next() {
    this.SaveFileService(this.uploadDocs);
    this.steps.emit(true);
  }

  prev() {
    this.SaveFileService(this.uploadDocs);
    this.steps.emit(false);
  }

  SaveFile(file: File, index: number) {
    // Guardar el archivo en el UploadDoc correspondiente
    this.uploadDocs[index].files = [file];
    this.isAllFilesUploaded = this.ValidateAllInputs();
  }
  
  SaveFileService(docs: UploadDoc[]) {
    console.log(docs)
    return this.eventService.saveFilesForm(docs);
  }

}
