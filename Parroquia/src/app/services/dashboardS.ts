import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { CardsInfo, ChartGetData, ChartGetDataPie, ResumeIA } from '../models/dashboardModels';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DashboardS {
  private apiurl=`${environment.apiurl}/dashboard`


  constructor(private http: HttpClient, public cookies: CookieService) {}

  getCardInfo(): Observable<CardsInfo>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<CardsInfo>(`${this.apiurl}/get/info_cards`,{headers})
  }

  getDataIngGas(): Observable<ChartGetData[]>{
    return this.http.get<ChartGetData[]>(`${this.apiurl}/show/lastest_months`)
  }

  getResumeIa():Observable<ResumeIA>{
    const token=this.cookies.get('access_token')
    const headers=new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ResumeIA>(`${this.apiurl}/response/geminifinances`,{headers})
  }

  getEventsDataPie(): Observable<ChartGetDataPie>{
    return this.http.get<ChartGetDataPie>(`${this.apiurl}/show/events_lastest_months`)
  }
}
