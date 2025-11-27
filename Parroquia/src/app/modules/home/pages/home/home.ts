import { ApplicationRef, ChangeDetectorRef, Component, ElementRef, inject, NgZone  } from '@angular/core';
import { HomeEventCards } from '../../components/home-event-cards/home-event-cards';
import { Publications } from '../../../../shared/publications/publications';
import { debounceTime, distinctUntilChanged, finalize, map, Observable, startWith, Subject, Subscription, switchMap } from 'rxjs';
import { Imagen } from '../../../../models/publication';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Home_Service } from '../../../../services/home';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [HomeEventCards, Publications, FormsModule, AsyncPipe, CommonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  errors_Exists = false;
  isloading = false;

  searchText: string = '';
  isSearching: boolean = false;
  
  searchSubject = new Subject<string>();
  eventList: {evento: string, date: string, hour: string}[] = [];
  publicList$!: Observable<{titulo: string, date: string, img: Imagen[], contenido: string}[]>;

  // Paginación
  allPublications: {titulo: string, date: string, img: Imagen[], contenido: string}[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  private home = inject(Home_Service);

  ngOnInit() {
    this.get_events();
    this.setupSearch();
  }

  setupSearch() {
    this.publicList$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(searchText => {
        // Reset página al buscar
        this.currentPage = 1;
        
        if (!searchText || searchText.trim() === '') {
          this.isSearching = false;
          return this.home.get_publication();
        }
        
        this.isSearching = true;
        return this.home.search_publications(searchText).pipe(
          finalize(() => this.isSearching = false)
        );
      }),
      map(publications => {
        const transformed = publications.map(p => ({
          titulo: p.titulo,
          date: p.fecha_hora,
          img: p.imagenes ?? [],
          contenido: p.contenido
        }));
        
        // Guardar todas las publicaciones y calcular páginas
        this.allPublications = transformed;
        this.totalPages = Math.ceil(this.allPublications.length / this.pageSize);
        
        // Retornar solo la página actual
        return this.paginateData();
      })
    );
  }

  paginateData(): {titulo: string, date: string, img: Imagen[], contenido: string}[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.allPublications.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.refreshPagination();
      // Scroll hacia arriba suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.refreshPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refreshPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  refreshPagination() {
    // Forzar actualización con los datos ya cargados
    this.publicList$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(searchText => {
        if (!searchText || searchText.trim() === '') {
          this.isSearching = false;
          return this.home.get_publication();
        }
        
        this.isSearching = true;
        return this.home.search_publications(searchText).pipe(
          finalize(() => this.isSearching = false)
        );
      }),
      map(publications => {
        const transformed = publications.map(p => ({
          titulo: p.titulo,
          date: p.fecha_hora,
          img: p.imagenes ?? [],
          contenido: p.contenido
        }));
        
        this.allPublications = transformed;
        this.totalPages = Math.ceil(this.allPublications.length / this.pageSize);
        
        return this.paginateData();
      })
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  get_events() {
    this.isloading = true;
    this.errors_Exists = false;

    this.home.get_parroquial().subscribe({
      next: (eventos) => {
        if (!eventos || eventos.length === 0) {
          this.errors_Exists = true;
          this.isloading = false;
          return;
        }

        eventos.forEach(e => {
          this.eventList.push({
            evento: e.descripcion,
            date: e.fecha,
            hour: `${e.hora_inicio} - ${e.hora_fin}`
          });
        });
        this.isloading = false;
      },
      error: (err) => {
        this.errors_Exists = true;
        this.isloading = false;
      },
      complete: () => {
        
      } 
    });
  }
}