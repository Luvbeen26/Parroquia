import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Eventos {
  private api_url='http://localhost:8000/event';

  constructor(private http: HttpClient){}

  public register_event(){
    
  }
}
