import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { getDocs } from '../models/document';
import { MatTooltipModule } from '@angular/material/tooltip';


@Injectable({
  providedIn: 'root'
})
export class DocumentoS {
  private apiurl=`${environment.apiurl}/docs`
  
  
  constructor(private http: HttpClient, public cookies: CookieService) {}
  

  getDocsByStatus(status:string,name:string | null, tipo:number | null): Observable<getDocs[]>{
    let params: any = { status: status };
    if (name !== null && name !== '') {
      params.nombre = name;
    }
    if (tipo !== null) {
      params.tipo = tipo.toString(); 
    }
    
    return this.http.get<getDocs[]>(`${this.apiurl}/show/docs`, { params: params });
  }

  rejectDoc(id:number,motivo:string): Observable<any>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const params = {id_documento: id,motivo: motivo};

    return this.http.put<any>(`${this.apiurl}/reject_file`,{},{ headers, params });
  }


  accepttDoc(id:number): Observable<any>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const params = {id_documento: id};

    return this.http.put<any>(`${this.apiurl}/accept_file`,{},{ headers, params });
  }
}
