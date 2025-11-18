import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Finanzas {
  private apiurl=`${environment.apiurl}/finanzas`

  constructor(private http: HttpClient, public cookies: CookieService) {}

}
