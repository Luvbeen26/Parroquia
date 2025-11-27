import { Component, inject } from '@angular/core';
import { CardEvents } from '../../components/card-events/card-events';
import { getEventInfo } from '../../../../models/event';
import { MatIconModule } from '@angular/material/icon';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Profile } from '../../../../services/profile';

@Component({
  selector: 'app-all-events',
  imports: [CardEvents, MatIconModule, CommonModule],
  templateUrl: './all-events.html',
  styleUrl: './all-events.css'
})
export class AllEvents {
  profile = inject(Profile);
  activeFilter: 'proximos' | 'pasados' = 'proximos';
  
  proxEvents$!: Observable<getEventInfo[]>;
  pastEvents$!: Observable<getEventInfo[]>;
  
  // Paginación para próximos eventos
  allProxEvents: getEventInfo[] = [];
  currentPageProx = 1;
  pageSizeProx = 10;
  totalPagesProx = 0;
  
  // Paginación para eventos pasados
  allPastEvents: getEventInfo[] = [];
  currentPagePast = 1;
  pageSizePast = 10;
  totalPagesPast = 0;

  ngOnInit() {
    const allEvents$ = this.profile.GetPendientAndPastEvents();

    this.proxEvents$ = allEvents$.pipe(
      map((res: any) => {
        this.allProxEvents = res.prox;
        this.totalPagesProx = Math.ceil(this.allProxEvents.length / this.pageSizeProx);
        return this.paginateProxData();
      })
    );

    this.pastEvents$ = allEvents$.pipe(
      map((res: any) => {
        this.allPastEvents = res.past;
        this.totalPagesPast = Math.ceil(this.allPastEvents.length / this.pageSizePast);
        return this.paginatePastData();
      })
    );
  }

  changeFilter(filter: 'proximos' | 'pasados'): void {
    this.activeFilter = filter;
  }

  // Métodos de paginación para próximos eventos
  paginateProxData(): getEventInfo[] {
    const startIndex = (this.currentPageProx - 1) * this.pageSizeProx;
    const endIndex = startIndex + this.pageSizeProx;
    return this.allProxEvents.slice(startIndex, endIndex);
  }

  changePageProx(page: number) {
    if (page >= 1 && page <= this.totalPagesProx) {
      this.currentPageProx = page;
      this.refreshProxPagination();
    }
  }

  nextPageProx() {
    if (this.currentPageProx < this.totalPagesProx) {
      this.currentPageProx++;
      this.refreshProxPagination();
    }
  }

  previousPageProx() {
    if (this.currentPageProx > 1) {
      this.currentPageProx--;
      this.refreshProxPagination();
    }
  }

  refreshProxPagination() {
    this.proxEvents$ = this.profile.GetPendientAndPastEvents().pipe(
      map((res: any) => this.paginateProxData())
    );
  }

  get pagesProx(): number[] {
    return Array.from({ length: this.totalPagesProx }, (_, i) => i + 1);
  }

  // Métodos de paginación para eventos pasados
  paginatePastData(): getEventInfo[] {
    const startIndex = (this.currentPagePast - 1) * this.pageSizePast;
    const endIndex = startIndex + this.pageSizePast;
    return this.allPastEvents.slice(startIndex, endIndex);
  }

  changePagePast(page: number) {
    if (page >= 1 && page <= this.totalPagesPast) {
      this.currentPagePast = page;
      this.refreshPastPagination();
    }
  }

  nextPagePast() {
    if (this.currentPagePast < this.totalPagesPast) {
      this.currentPagePast++;
      this.refreshPastPagination();
    }
  }

  previousPagePast() {
    if (this.currentPagePast > 1) {
      this.currentPagePast--;
      this.refreshPastPagination();
    }
  }

  refreshPastPagination() {
    this.pastEvents$ = this.profile.GetPendientAndPastEvents().pipe(
      map((res: any) => this.paginatePastData())
    );
  }

  get pagesPast(): number[] {
    return Array.from({ length: this.totalPagesPast }, (_, i) => i + 1);
  }
}