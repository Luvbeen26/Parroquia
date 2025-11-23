import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Publication } from '../models/publication';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Publications {
  private api_public=`${environment.apiurl}/publication`;

  constructor(private http:HttpClient){}


  public get_publication():  Observable<Publication[]>{
    return this.http.get<Publication[]>(`${this.api_public}/show/publication`)
  }

  public search_publications(texto:string): Observable<Publication[]>{
    const params= new HttpParams().set("texto",texto);
    return this.http.get<Publication[]>(`${this.api_public}/search/publication`,{params})
  }

  public delete_publications(id:number): Observable<any>{
    const params= new HttpParams().set("id_publicacion",id);
    return this.http.delete<any>(`${this.api_public}/delete/publication`,{params})
  }
}
