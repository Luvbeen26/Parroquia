import { Component, EventEmitter, Input, input, Output } from '@angular/core';

@Component({
  selector: 'app-document-upload',
  imports: [],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css'
})
export class DocumentUpload {
  @Input() archivoreal!: File;
  @Input() id?:number;
  @Output() archivo=new EventEmitter<File>;

  tipo=input<string>();

  filename:string | null = null;

  FileSelected(ev:Event):void{
    const inputfile = ev.target as HTMLInputElement;

    if(inputfile.files){
      this.filename=inputfile.files[0].name;
      this.archivo.emit(inputfile.files[0])
    }else{
      this.filename=null;
    }
  }

  ngOnInit(){
    if(this.archivoreal){
      this.filename=this.archivoreal.name;
    }
  }

}
