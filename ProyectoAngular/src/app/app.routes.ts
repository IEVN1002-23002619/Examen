import { Routes } from '@angular/router';
import { PizzeriaComponent } from './pizzeria/pizzeria';
import { DetalleVentaComponent } from './ventas/detalle-venta';

export const routes: Routes = [
  { path: '', component: PizzeriaComponent },
  { path: 'ventas/:idpedido', component: DetalleVentaComponent },
  { path: '**', redirectTo: '' }
];
