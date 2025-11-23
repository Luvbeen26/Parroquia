import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllFinanzas, RegFinanza } from '../models/finanzas';

@Injectable({
  providedIn: 'root'
})
export class Finanzas {
  private apiurl=`${environment.apiurl}/finanzas`

  constructor(private http: HttpClient, public cookies: CookieService) {}

  GetAllTransaccion(fecha_inicio:string | null, fecha_fin:string | null, id_categoria:number | null): Observable <GetAllFinanzas[]>{
    let params: any = {};
    if (id_categoria !== null) params.id_categoria = id_categoria;
    if (fecha_inicio !== null) params.fecha_inicio = fecha_inicio;
    if (fecha_fin !== null) params.fecha_final = fecha_fin;
    
    return this.http.get<GetAllFinanzas[]>(`${this.apiurl}/show/all_transaccion`,{ params });
  }

  RegTransaccion(monto:number,descripcion:string,id_categoria:number,evidencia:File | null): Observable <RegFinanza>{
    const formData=new FormData();
    formData.append("monto",monto.toString());
    formData.append("id_categoria",id_categoria.toString());
    formData.append("descripcion",descripcion);
    if (evidencia !== null) {
      formData.append("image", evidencia);
    }
    
    return this.http.post<RegFinanza>(`${this.apiurl}/register/transaccion`,formData)
  }



  UpdTransaccion(id_transaccion:number,monto:number,id_categoria:number,descripcion:string,image:File | null){
    const formData=new FormData();
    formData.append("id_transaccion",id_transaccion.toString())
    formData.append("monto",monto.toString());
    formData.append("id_categoria",id_categoria.toString());
    formData.append("descripcion",descripcion);
  
    if (image) {
      formData.append("image", image);
    }
    
    return this.http.put<RegFinanza>(`${this.apiurl}/update/transaccion`,formData)
  }

  DelTransaccion(id_transaccion:number): Observable<any> {
    return this.http.delete<any>(`${this.apiurl}/delete/transaccion`,{params: { id_transaccion }});
  }
}
