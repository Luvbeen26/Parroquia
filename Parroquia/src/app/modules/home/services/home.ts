import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parroquial } from '../../../models/event';
import { BehaviorSubject, interval, Observable, switchMap } from 'rxjs';
import { Publication } from '../../../models/publication';
import { environment } from '../../../environment/environment';
import { Notif } from '../../../models/user';


@Injectable({
  providedIn: 'root'
})
export class Home_Service {
  private apiurl=`${environment.apiurl}/auth`
 /* private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
*/
  private api_event=`${environment.apiurl}/event`;
  private api_public=`${environment.apiurl}/publication`;
  private api_notif=`${environment.apiurl}/notification`;

/*
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
*/

  constructor(private http:HttpClient){}
/*
  startPolling() {
    return interval(30000).pipe(
      switchMap(() => this.getNotifications())
    ).subscribe();
  }
*/
  public get_parroquial(): Observable<parroquial[]>{
    return this.http.get<parroquial[]>(`${this.api_event}/get/all_parroquial`)
  }

  public get_publication():  Observable<Publication[]>{
    return this.http.get<Publication[]>(`${this.api_public}/show/publication`)
  }

  public search_publications(texto:string): Observable<Publication[]>{
    const params= new HttpParams().set("texto",texto);
    return this.http.get<Publication[]>(`${this.api_public}/search/publication`,{params})
  }
/*
  getNotifications(): Observable<Notif[]> {
    return this.http.get<Notif[]>(`${this.api_notif}/get_notifications`);
  }

  updateNotifications(notifications: Notif[]) {
    this.notificationsSubject.next(notifications);
    const unread = notifications.filter(n => !n.leido).length;
    this.unreadCountSubject.next(unread);
  }
*/
}
