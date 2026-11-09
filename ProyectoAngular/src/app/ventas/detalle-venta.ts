import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PizzeriaapiService } from '../utl/pizzeriaapi.service';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-venta.html',
  styleUrl: './detalle-venta.css'
})
export class DetalleVentaComponent implements OnInit {
  pedido: any = null;
  idpedido = 0;

  constructor(private route: ActivatedRoute, public pizzeriaUtl: PizzeriaapiService) { }

  ngOnInit(): void {
    this.idpedido = Number(this.route.snapshot.paramMap.get('idpedido'));
    this.pizzeriaUtl.getPedido(this.idpedido).subscribe({
      next: (response: any) => this.pedido = response.pedido,
      error: (error) => {
        console.error('Error al consultar el pedido:', error);
        alert('No se pudo consultar el detalle de la venta');
      }
    });
  }
}
