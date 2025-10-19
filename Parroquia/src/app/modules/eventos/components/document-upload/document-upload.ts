import { Component, input } from '@angular/core';

@Component({
  selector: 'app-document-upload',
  imports: [],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css'
})
export class DocumentUpload {
  tipo=input<string>();

  filename:string | null = null;

  FileSelected(ev:Event):void{
    const inputfile = ev.target as HTMLInputElement;

    if(inputfile.files){
      this.filename=inputfile.files[0].name;
    }else{
      this.filename=null;
    }
  }
}
