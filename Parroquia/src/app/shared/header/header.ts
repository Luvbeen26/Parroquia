import { httpResource } from '@angular/common/http';
import { Component, ElementRef, ViewChild,input} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  header_v=input<number>(0);
  @ViewChild("toggle") toggleRef!:ElementRef;
  @ViewChild("items") itemsRef!:ElementRef;



  toggleMenu() {
    this.itemsRef.nativeElement.classList.toggle("open");
    this.toggleRef.nativeElement.classList.toggle("close");
  }


}

