import { Injectable } from '@angular/core';


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

import { environment } from '../environment/environment';
import { PendientProcessClient, ProxPastEventsClient } from '../models/event';
import { docs_event } from '../models/document';
import { Change_password, ChangeInfo, Userbase } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class Profile {
  private apiurl=`${environment.apiurl}`

  constructor(private http:HttpClient,public cookies:CookieService){}

  GetPendientEventsUser(): Observable<PendientProcessClient[]>{
    return this.http.get<PendientProcessClient[]>(`${this.apiurl}/event/show/user/pendientes_eventos`);
  }

  GetPendientAndPastEvents(): Observable<ProxPastEventsClient>{
    return this.http.get<ProxPastEventsClient>(`${this.apiurl}/event/show/user/past&prox`);
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

  getUserData(): Observable<Userbase>{
    return this.http.get<Userbase>(`${this.apiurl}/users/info_user`)
  }


  ChangePersonalInfo(nombres:string, apellidos:string):Observable<ChangeInfo>{
    const body={nombres:nombres, apellidos:apellidos}
    return this.http.put<ChangeInfo>(`${this.apiurl}/users/change_personal`,body)
  }

  ChangePassword(actual:string,new_pass:string): Observable<Change_password>{
    const body={password: new_pass,old_password:actual}
    return this.http.put<Change_password>(`${this.apiurl}/users/change_password`,body)
  }
}
