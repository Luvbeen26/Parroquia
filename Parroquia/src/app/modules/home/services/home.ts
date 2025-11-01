import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parroquial } from '../../../models/event';
import { Observable } from 'rxjs';
import { Publication } from '../../../models/publication';


@Injectable({
  providedIn: 'root'
})
export class Home_Service {
  private api_event='http://localhost:8000/event';
  private api_public='http://localhost:8000/publication';

  constructor(private http:HttpClient){}

  public get_parroquial(): Observable<parroquial[]>{
    return this.http.get<parroquial[]>(`${this.api_event}/get/all_parroquial`)
  }

  public get_publication():  Observable<Publication[]>{
    return this.http.get<Publication[]>(`${this.api_public}/show/publication`)
  }
}
