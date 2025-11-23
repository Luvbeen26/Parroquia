import { ApplicationRef, ChangeDetectorRef, Component, ElementRef, inject, NgZone  } from '@angular/core';
import { HomeEventCards } from '../../components/home-event-cards/home-event-cards';
import { Publications } from '../../../../shared/publications/publications';
import { debounceTime, distinctUntilChanged, finalize, map, Observable, startWith, Subject, Subscription, switchMap } from 'rxjs';

import { Imagen } from '../../../../models/publication';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { afterEach } from 'node:test';
import { Home_Service } from '../../../../services/home';

@Component({
  selector: 'app-home',
  imports: [HomeEventCards,Publications,FormsModule,AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  errors_Exists=false
  isloading=false

  searchText: string = '';
  isSearching: boolean = false;
  
  searchSubject = new Subject<string>();
  eventList:{evento:string,date:string,hour:string}[] = [];
  publicList$!: Observable<{titulo:string, date:string, img:Imagen[], contenido:string}[]>;

  private home=inject(Home_Service)

  ngOnInit(){
    this.get_events();
    this.setupSearch();
  }

  setupSearch() {
    this.publicList$ = this.searchSubject.pipe(
      startWith(''), //primero ejecuta como si se hubiese ingresado un valor vacio
      debounceTime(500), //espera .5s despues del ultimo valor ingresado
      distinctUntilChanged(), //pasa si ambos valores entre .5s son igual para no saturar el servidor
      switchMap(searchText => { //recibe el searchtext y ejecuta las respectivas funciones
        if (!searchText || searchText.trim() === '') {
          this.isSearching = false;
          return this.home.get_publication();
        }
        
        this.isSearching = true;
        return this.home.search_publications(searchText).pipe(
          finalize(() => this.isSearching = false)
        );
      }),
      // Transformar Publication[] al formato esperado
      map(publications => publications.map(p => ({
        titulo: p.titulo,
        date: p.fecha_hora,
        img: p.imagenes ?? [],
        contenido: p.contenido
      })))
    );
  }
  
  get_events(){
    this.isloading = true
    this.errors_Exists = false

    this.home.get_parroquial().subscribe({
      next: (eventos) => {
        if(!eventos || eventos.length ===0){
          this.errors_Exists = true
          this.isloading = false
          
          return
        }

        eventos.forEach(e =>{
          this.eventList.push({evento:e.descripcion,date:e.fecha,hour:`${e.hora_inicio} - ${e.hora_fin}`})
        })
        this.isloading = false
      },
      error: (err) => {
        this.errors_Exists=true
        this.isloading = false
      },
      complete: () =>{
        console.log("Completo")
      } 
    })
  }

}
