import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { createPublication, Publication } from '../models/publication';
import { Observable } from 'rxjs';
import { title } from 'node:process';

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

  public create_publications(titulo:string,contenido:string,imagenes:File[]): Observable<createPublication>{
    const formData=new FormData();
    formData.append("titulo",titulo);

    if(contenido){
      formData.append("contenido",contenido);
    }
    
    if (imagenes && imagenes.length > 0) {
      imagenes.forEach(img => {
        formData.append("imagenes", img);
      });
    }
    return this.http.post<createPublication>(`${this.api_public}/create/publication_imagenes`,formData)
  }

  public edit_Publications(id_publicacion:number,titulo:string,contenido:string,imagenes:File[],imagenes_eliminar: number[]): Observable<createPublication>{
    const formData = new FormData();
    formData.append("id_publicacion", id_publicacion.toString());
    formData.append("titulo", titulo);

    formData.append("contenido", contenido || '');

    if (imagenes && imagenes.length > 0) {
    imagenes.forEach(img => {
      formData.append("imagenes", img);
    });
  }

    if (imagenes_eliminar.length > 0) {
      formData.append("imagenes_eliminar", JSON.stringify(imagenes_eliminar));
    }

    return this.http.put<createPublication>(`${this.api_public}/edit/publication`, formData);
  }

  public get_publicationbyid(id: number): Observable<Publication> {
    return this.http.get<Publication>(`${this.api_public}/get/publication?id_publicacion=${id}`);
  }

}
