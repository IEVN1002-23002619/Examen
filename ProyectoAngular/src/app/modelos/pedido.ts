export interface PizzaPedido {
  tamano: string;
  ingredientes: string[];
  cantidad: number;
  precio_unitario?: number;
  subtotal: number;
}

export interface DatosCliente {
  nombre_cliente: string;
  direccion: string;
  telefono: string;
  fecha_pedido: string;
}

export interface PedidoNuevo extends DatosCliente {
  pizzas: PizzaPedido[];
}

export interface Venta {
  idpedido: number;
  nombre_cliente: string;
  direccion: string;
  telefono: string;
  fecha_pedido: string;
  total: number;
}
