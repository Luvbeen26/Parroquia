import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { Publications } from '../../../../../shared/publications/publications';
import { BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, startWith, Subject, switchMap, tap } from 'rxjs';
import { Publication } from '../../../../../models/publication';
import { ToastrService } from 'ngx-toastr';
import { Publications as PublicS } from '../../../../../services/publications';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule,FormsModule,MatIconModule,Publications,RouterLink],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones {
  publiService=inject(PublicS)
  toast=inject(ToastrService)
  isLoading:boolean=false;



  searchText: string = '';
  isSearching: boolean = false;

  search=new Subject<string>


  publicList=new BehaviorSubject<Publication[]>([])
  publicaciones$=this.publicList.asObservable();
  

  ngOnInit(){

    console.log(1)
      this.GetPublications()
    console.log(2)

    this.search.subscribe(searchValue => {
      this.searchText = searchValue; // Actualiza searchText
      this.GetPublications(); // Llama a cargar con el nuevo valor
    });
  }

  GetPublications(){
    this.isLoading=true;
    //this.publiclist = [];

    if(this.searchText && this.searchText.trim() !== ''){
      this.publiService.search_publications(this.searchText).subscribe({
        next: res => {
          const publics = res.map(p => ({
            id_publicacion: p.id_publicacion,
            titulo: p.titulo,
            contenido: p.contenido,
            fecha_hora: p.fecha_hora,
            imagenes: p.imagenes
          }));
          this.publicList.next(publics);
          this.isLoading = false; 
        },
        error: err => {
          console.error('Error en búsqueda:', err);
          this.isLoading = false; 
        }
      });
      this.isLoading = false; 

    }else{
      this.publiService.get_publication().subscribe(res =>{
        const publics=res.map(p=>({
          id_publicacion:p.id_publicacion,
          titulo:p.titulo,
          contenido:p.contenido,
          fecha_hora:p.fecha_hora,
          imagenes:p.imagenes
        }));
        this.publicList.next(publics);
        this.isLoading=false
      },);
      this.isLoading=false
    }
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.next(value);
  }

  resetFilters(): void {
    this.searchText = '';
    this.search.next('');
  }

  editPublication(publication: Publication): void {
    this.toast.info(`Editando: ${publication.titulo}`);
  }

  deletePublication(id:number): void { 
    this.publiService.delete_publications(id).subscribe({
      next:res=>{
        this.toast.success("Publicacion eliminada correctamente")
        this.GetPublications();
      },
      error:err=>{
        this.toast.error("Error al eliminar la publicacion")
      }
    })
  }
}
