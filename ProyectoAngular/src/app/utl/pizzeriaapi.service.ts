import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoNuevo, Venta } from '../modelos/pedido';

@Injectable({
  providedIn: 'root'
})
export class PizzeriaapiService {
  private apiUrl = 'http://127.0.0.1:5000/api/pedidos';

  constructor(private http: HttpClient) { }

  registrarPedido(datos: PedidoNuevo): Observable<any> {
    return this.http.post(this.apiUrl + '/', datos);
  }

  public getVentasDia(dia: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/ventas/dia/' + encodeURIComponent(dia));
  }

  public getVentasMes(mes: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/ventas/mes/' + encodeURIComponent(mes));
  }

  public getPedido(idpedido: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/' + idpedido);
  }
}
