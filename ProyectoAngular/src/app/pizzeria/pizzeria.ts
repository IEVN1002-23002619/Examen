import { Component } from '@angular/core';
import { PedidoFormComponent } from '../pedido-form/pedido-form';
import { DetallePedidoComponent } from '../detalle-pedido/detalle-pedido';
import { VentasComponent } from '../ventas/ventas';
import { PizzeriaapiService } from '../utl/pizzeriaapi.service';
import { DatosCliente, PedidoNuevo, PizzaPedido } from '../modelos/pedido';

@Component({
  selector: 'app-pizzeria',
  standalone: true,
  imports: [PedidoFormComponent, DetallePedidoComponent, VentasComponent],
  templateUrl: './pizzeria.html',
  styleUrl: './pizzeria.css'
})
export class PizzeriaComponent {
  cliente: DatosCliente | null = null;
  pizzas: PizzaPedido[] = [];
  totalPedido = 0;
  precios = { Chica: 40, Mediana: 80, Grande: 120 };

  constructor(public pizzeriaUtl: PizzeriaapiService) { }

  agregarPizza(datos: any): void {
    this.cliente = datos.cliente;
    const pizza = datos.pizza as PizzaPedido;
    const precioBase = this.precios[pizza.tamano as keyof typeof this.precios] || 0;
    const precioUnitario = precioBase + (pizza.ingredientes.length * 10);
    pizza.subtotal = precioUnitario * pizza.cantidad;
    pizza.precio_unitario = precioUnitario;
    this.pizzas.push(pizza);
    this.calcularTotal();
  }

  quitarPizza(indice: number): void {
    this.pizzas.splice(indice, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalPedido = this.pizzas.reduce((total, pizza) => total + pizza.subtotal, 0);
  }

  terminarPedido(): void {
    if (!this.cliente || this.pizzas.length === 0) {
      alert('Completa los datos y agrega una pizza antes de terminar');
      return;
    }

    const datos: PedidoNuevo = {
      ...this.cliente,
      pizzas: this.pizzas
    };

    this.pizzeriaUtl.registrarPedido(datos).subscribe({
      next: (respuesta: any) => {
        alert(respuesta.flash?.[0] || respuesta.mensaje);
        this.cliente = null;
        this.pizzas = [];
        this.totalPedido = 0;
      },
      error: (error) => {
        console.error('Error al registrar el pedido:', error);
        alert(error.error?.mensaje || 'Ocurrió un error al registrar el pedido');
      }
    });
  }
}
