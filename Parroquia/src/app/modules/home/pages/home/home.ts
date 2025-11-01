import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { HomeEventCards } from '../../components/home-event-cards/home-event-cards';
import { Publications } from '../../../../shared/publications/publications';
import { Observable } from 'rxjs';
import { Home_Service } from '../../services/home';
import { parroquial } from '../../../../models/event';
import { Imagen } from '../../../../models/publication';

@Component({
  selector: 'app-home',
  imports: [HomeEventCards,Publications],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  
  errors_Exists=false
  isloading=false
  
  eventList:{evento:string,date:string,hour:string}[] = [];
  publicList: {titulo:string,date:string,img:Imagen[],contenido:string}[] = [];

  private home=inject(Home_Service)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(){
    this.get_events();
    this.get_publications();
  }

  get_events(){
    this.isloading = true
    this.errors_Exists = false

    this.home.get_parroquial().subscribe({
      next: (eventos) => {

        if(!eventos || eventos.length ===0){
          this.errors_Exists = true
          this.isloading = false
          this.cdr.detectChanges()
          return
        }

        eventos.forEach(e =>{
          this.eventList.push({evento:e.descripcion,date:e.fecha,hour:`${e.hora_inicio} - ${e.hora_fin}`})
        })

        this.isloading = false

        console.log(eventos)
      },
      error: (err) => {
        this.errors_Exists=true
        this.isloading = false
        this.cdr.detectChanges()
        console.log(err)

      },
      complete: () =>{
        console.log("Completo")
      } 
    })
  }

  get_publications(){
    this.home.get_publication().subscribe({
      next: (publications) => {
        if(!publications || publications.length === 0){

        }

        publications.forEach(p =>{
            console.log(p.imagenes)
            this.publicList.push({titulo:p.titulo,date:p.fecha_hora,img:p.imagenes ?? [],contenido:p.contenido})
        })
      },
      error: (err) =>{
        console.log(err)
      },
      complete: () =>{
        console.log(this.publicList)
        console.log("Correcto")
      } 
    })
  }

}
