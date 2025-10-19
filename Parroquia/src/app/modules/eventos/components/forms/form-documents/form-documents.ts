import { Component, input } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { DocumentUpload } from '../../document-upload/document-upload';
import { Event } from '@angular/router';

@Component({
  selector: 'app-form-documents',
  imports: [HeaderForm,DocumentUpload],
  templateUrl: './form-documents.html',
  styleUrl: './form-documents.css'
})
export class FormDocuments {
  fileList=input<string[]>();

  
}
