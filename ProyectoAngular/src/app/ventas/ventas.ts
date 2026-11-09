import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PizzeriaapiService } from '../utl/pizzeriaapi.service';
import { Venta } from '../modelos/pedido';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasComponent implements OnInit {
  dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  formularioDia: FormGroup;
  formularioMes: FormGroup;
  ventasDia: Venta[] = [];
  ventasMes: Venta[] = [];
  totalDia = 0;
  totalMes = 0;

  constructor(private fb: FormBuilder, public pizzeriaUtl: PizzeriaapiService) {
    const fecha = new Date();
    this.formularioDia = this.fb.group({ dia: [this.dias[(fecha.getDay() + 6) % 7]] });
    this.formularioMes = this.fb.group({ mes: [this.meses[fecha.getMonth()]] });
  }

  ngOnInit(): void {
    this.consultarDia();
    this.consultarMes();
  }

  consultarDia(): void {
    const dia = this.formularioDia.get('dia')?.value;
    this.pizzeriaUtl.getVentasDia(dia).subscribe({
      next: (response: any) => {
        this.ventasDia = response.ventas || [];
        this.totalDia = response.total_acumulado || 0;
      },
      error: (error) => console.log(error)
    });
  }

  consultarMes(): void {
    const mes = this.formularioMes.get('mes')?.value;
    this.pizzeriaUtl.getVentasMes(mes).subscribe({
      next: (response: any) => {
        this.ventasMes = response.ventas || [];
        this.totalMes = response.total_acumulado || 0;
      },
      error: (error) => console.log(error)
    });
  }
}
