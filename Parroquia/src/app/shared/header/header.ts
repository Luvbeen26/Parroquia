import { httpResource } from '@angular/common/http';
import { Component, ElementRef, PLATFORM_ID, ViewChild,inject,input} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [RouterLink,MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private auth=inject(Auth)
  private platformId=inject(PLATFORM_ID)

  
  isauth=false;
  es_admin: boolean | null=null
  header_v=0;
  @ViewChild("toggle") toggleRef!:ElementRef;
  @ViewChild("items") itemsRef!:ElementRef;

  ngOnInit(){
    if(isPlatformBrowser(this.platformId)){
      this.loadUserData();

      this.auth.currentUser$.subscribe(user =>{
        this.loadUserData();
      })
    }
  }

  private loadUserData(){
    this.isauth=this.auth.isAuthenticated();
    this.es_admin=this.auth.get_userRol();
  }

  toggleMenu() {
    this.itemsRef.nativeElement.classList.toggle("open");
    this.toggleRef.nativeElement.classList.toggle("close");
  }

  logout(){
    this.auth.logout();
  }
}

