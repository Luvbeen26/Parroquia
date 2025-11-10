import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';


@Component({
  selector: 'app-card-rejected',
  imports: [MatIcon],
  templateUrl: './card-rejected.html',
  styleUrl: './card-rejected.css'
})
export class CardRejected {
  @Input() id_docs!:number;
  @Input() motivo!:string;
  @Input() descripcion!:string;
  @Output() archivo=new EventEmitter<File>;
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
}
