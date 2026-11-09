import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosCliente, PizzaPedido } from '../modelos/pedido';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pedido-form.html',
  styleUrl: './pedido-form.css'
})
export class PedidoFormComponent {
  @Output() agregarPizza = new EventEmitter<any>();

  formulario: FormGroup;
  ingredientes = ['Jamón', 'Piña', 'Champiñones'];
  precios = { Chica: 40, Mediana: 80, Grande: 120 };

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      nombre_cliente: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha_pedido: [this.fechaHoy(), Validators.required],
      tamano: ['Mediana', Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  fechaHoy(): string {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return fecha.getFullYear() + '-' + mes + '-' + dia;
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const ingredientesSeleccionados: string[] = [];
    if (datos.jamon) ingredientesSeleccionados.push('Jamón');
    if (datos.pina) ingredientesSeleccionados.push('Piña');
    if (datos.champinones) ingredientesSeleccionados.push('Champiñones');

    const pizza: PizzaPedido = {
      tamano: datos.tamano,
      ingredientes: ingredientesSeleccionados,
      cantidad: Number(datos.cantidad),
      subtotal: 0
    };

    const cliente: DatosCliente = {
      nombre_cliente: datos.nombre_cliente,
      direccion: datos.direccion,
      telefono: datos.telefono,
      fecha_pedido: datos.fecha_pedido
    };

    this.agregarPizza.emit({ cliente, pizza });
  }
}
