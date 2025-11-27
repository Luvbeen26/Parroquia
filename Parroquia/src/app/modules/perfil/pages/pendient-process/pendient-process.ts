import { Component, inject } from '@angular/core';
import { PendientProcessClient } from '../../../../models/event';

import { MatIcon, MatIconModule,  } from '@angular/material/icon';
import { EventUser } from '../../components/event-user/event-user';

import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Profile } from '../../../../services/profile';


@Component({
  selector: 'app-pendient-process',
  imports: [EventUser,MatIcon,CommonModule],
  templateUrl: './pendient-process.html',
  styleUrl: './pendient-process.css'
})
export class PendientProcess {
  Process$!: Observable<PendientProcessClient[]>;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  allProcess: PendientProcessClient[] = [];

  profileService = inject(Profile);

  ngOnInit() {
    this.Process$ = this.profileService.GetPendientEventsUser().pipe(
      map(data => {
        this.allProcess = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        return this.paginateData(data);
      })
    );
  }

  paginateData(data: PendientProcessClient[]): PendientProcessClient[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.Process$ = this.profileService.GetPendientEventsUser().pipe(
        map(data => this.paginateData(data))
      );
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.refreshPagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refreshPagination();
    }
  }

  refreshPagination() {
    this.Process$ = this.profileService.GetPendientEventsUser().pipe(
      map(data => this.paginateData(data))
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}