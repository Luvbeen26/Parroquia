import { Injectable } from '@angular/core';
import { docs_event, get_user_docs } from '../../../models/document';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { PendientProcessClient, ProxPastEventsClient } from '../../../models/event';

@Injectable({
  providedIn: 'root'
})
export class Profile {
  private apiurl=`${environment.apiurl}`

  constructor(private http:HttpClient,public cookies:CookieService){}

  GetPendientEventsUser(): Observable<PendientProcessClient[]>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<PendientProcessClient[]>(`${this.apiurl}/event/show/user/pendientes_eventos`,{ headers });
  }

  GetPendientAndPastEvents(): Observable<ProxPastEventsClient>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ProxPastEventsClient>(`${this.apiurl}/event/show/user/pendientes&prox`,{ headers });
  }

  GetRejectedDocs(id_evento:number): Observable<docs_event[]>{
    return this.http.get<docs_event[]>(`${this.apiurl}/docs/show/rejected/${id_evento} `)
  }

  UpdateDocs(ids:string,updtDocs:File[]): Observable<File[]>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const formData=new FormData();
    formData.append('id_docs',ids)

    updtDocs.forEach(d=>{
      formData.append('files',d)
    })
    
    

    return this.http.put<File[]>(`${this.apiurl}/docs/re_update_file`,formData,{headers})
  }

}
