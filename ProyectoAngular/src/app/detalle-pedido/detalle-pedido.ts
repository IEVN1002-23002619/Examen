import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PizzaPedido } from '../modelos/pedido';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.css'
})
export class DetallePedidoComponent {
  @Input() pizzas: PizzaPedido[] = [];
  @Input() totalPedido = 0;
  @Output() quitarPizza = new EventEmitter<number>();
  @Output() terminarPedido = new EventEmitter<void>();

  seleccionada: number | null = null;

  seleccionar(indice: number): void {
    this.seleccionada = indice;
  }

  quitar(): void {
    if (this.seleccionada !== null) {
      this.quitarPizza.emit(this.seleccionada);
      this.seleccionada = null;
    }
  }

  terminar(): void {
    if (this.pizzas.length > 0) {
      this.terminarPedido.emit();
    } else {
      alert('Agrega una pizza antes de terminar el pedido');
    }
  }
}
