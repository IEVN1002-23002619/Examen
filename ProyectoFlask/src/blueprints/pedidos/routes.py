from datetime import date, datetime
from decimal import Decimal

from flask import Blueprint, flash, get_flashed_messages, jsonify, request

from database import mysql

pedidos_bp = Blueprint(
    'pedidos',
    __name__,
    url_prefix='/api/pedidos'
)

precios_tamano = {
    'Chica': 40.00,
    'Mediana': 80.00,
    'Grande': 120.00
}

precio_ingrediente = 10.00
ingredientes_disponibles = ('Jamón', 'Piña', 'Champiñones')
dias_semana = {
    'lunes': 0,
    'martes': 1,
    'miércoles': 2,
    'miercoles': 2,
    'jueves': 3,
    'viernes': 4,
    'sábado': 5,
    'sabado': 5,
    'domingo': 6
}
meses = {
    'enero': 1,
    'febrero': 2,
    'marzo': 3,
    'abril': 4,
    'mayo': 5,
    'junio': 6,
    'julio': 7,
    'agosto': 8,
    'septiembre': 9,
    'octubre': 10,
    'noviembre': 11,
    'diciembre': 12
}


def fila_a_diccionario(cursor, fila):
    columnas = [columna[0] for columna in cursor.description]
    datos = dict(zip(columnas, fila))

    for campo, valor in datos.items():
        if isinstance(valor, Decimal):
            datos[campo] = float(valor)
        elif isinstance(valor, (date, datetime)):
            datos[campo] = valor.isoformat()

    return datos


def leer_pedido_bd(idpedido):
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT * FROM pedidos WHERE idpedido=%s',
            (idpedido,)
        )
        fila = cursor.fetchone()
        if fila:
            return fila_a_diccionario(cursor, fila)
        return None
    finally:
        if cursor is not None:
            cursor.close()


@pedidos_bp.route('/', methods=['POST'])
def registrar_pedido():
    cursor = None
    try:
        datos = request.get_json()
        campos = ('nombre_cliente', 'direccion', 'telefono', 'fecha_pedido')
        if not datos or any(not datos.get(campo) for campo in campos):
            return jsonify({
                'mensaje': 'Completa los datos del cliente y la fecha del pedido',
                'exito': False
            }), 400

        pizzas = datos.get('pizzas', [])
        if not pizzas:
            return jsonify({
                'mensaje': 'Agrega por lo menos una pizza al pedido',
                'exito': False
            }), 400

        detalle = []
        total = 0.00
        for pizza in pizzas:
            tamano = pizza.get('tamano')
            ingredientes = pizza.get('ingredientes', [])
            cantidad = pizza.get('cantidad')

            if tamano not in precios_tamano:
                return jsonify({
                    'mensaje': 'El tamaño de pizza no es válido',
                    'exito': False
                }), 400
            if not isinstance(ingredientes, list) or any(
                ingrediente not in ingredientes_disponibles
                for ingrediente in ingredientes
            ):
                return jsonify({
                    'mensaje': 'Los ingredientes del pedido no son válidos',
                    'exito': False
                }), 400
            if not isinstance(cantidad, int) or cantidad < 1:
                return jsonify({
                    'mensaje': 'La cantidad de pizzas debe ser mayor a cero',
                    'exito': False
                }), 400

            precio_unitario = precios_tamano[tamano] + (
                len(ingredientes) * precio_ingrediente
            )
            subtotal = precio_unitario * cantidad
            total += subtotal
            detalle.append((
                tamano,
                ', '.join(ingredientes) if ingredientes else 'Sin ingredientes',
                cantidad,
                precio_unitario,
                subtotal
            ))

        cursor = mysql.connection.cursor()
        cursor.execute(
            'INSERT INTO pedidos '
            '(nombre_cliente, direccion, telefono, fecha_pedido, total) '
            'VALUES (%s, %s, %s, %s, %s)',
            (
                datos['nombre_cliente'],
                datos['direccion'],
                datos['telefono'],
                datos['fecha_pedido'],
                total
            )
        )
        idpedido = cursor.lastrowid

        for pizza in detalle:
            cursor.execute(
                'INSERT INTO detalle_pedido '
                '(idpedido, tamano, ingredientes, cantidad, precio_unitario, subtotal) '
                'VALUES (%s, %s, %s, %s, %s, %s)',
                (idpedido,) + pizza
            )

        mysql.connection.commit()
        mensaje = 'Pedido registrado. Total a pagar: ${:.2f}'.format(total)
        flash(mensaje, 'success')
        mensajes = get_flashed_messages(category_filter=['success'])
        return jsonify({
            'idpedido': idpedido,
            'total': total,
            'mensaje': mensaje,
            'flash': mensajes,
            'exito': True
        }), 201
    except Exception:
        mysql.connection.rollback()
        return jsonify({
            'mensaje': 'Error al registrar el pedido',
            'exito': False
        }), 500
    finally:
        if cursor is not None:
            cursor.close()


@pedidos_bp.route('/ventas/dia/<dia>', methods=['GET'])
def ventas_por_dia(dia):
    cursor = None
    try:
        dia = dia.strip().lower()
        if dia not in dias_semana:
            return jsonify({
                'mensaje': 'Escribe un día válido de la semana',
                'exito': False
            }), 400

        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT idpedido, nombre_cliente, direccion, telefono, fecha_pedido, total '
            'FROM pedidos WHERE WEEKDAY(fecha_pedido)=%s '
            'ORDER BY fecha_pedido DESC, idpedido DESC',
            (dias_semana[dia],)
        )
        filas = cursor.fetchall()
        ventas = [fila_a_diccionario(cursor, fila) for fila in filas]
        total = sum(venta['total'] for venta in ventas)
        return jsonify({
            'ventas': ventas,
            'total_acumulado': total,
            'mensaje': 'Ventas del día consultadas',
            'exito': True
        }), 200
    except Exception:
        return jsonify({
            'mensaje': 'Error al consultar las ventas del día',
            'exito': False
        }), 500
    finally:
        if cursor is not None:
            cursor.close()


@pedidos_bp.route('/ventas/mes/<mes>', methods=['GET'])
def ventas_por_mes(mes):
    cursor = None
    try:
        mes = mes.strip().lower()
        if mes not in meses:
            return jsonify({
                'mensaje': 'Escribe el nombre de un mes válido',
                'exito': False
            }), 400

        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT idpedido, nombre_cliente, direccion, telefono, fecha_pedido, total '
            'FROM pedidos WHERE MONTH(fecha_pedido)=%s '
            'ORDER BY fecha_pedido DESC, idpedido DESC',
            (meses[mes],)
        )
        filas = cursor.fetchall()
        ventas = [fila_a_diccionario(cursor, fila) for fila in filas]
        total = sum(venta['total'] for venta in ventas)
        return jsonify({
            'ventas': ventas,
            'total_acumulado': total,
            'mensaje': 'Ventas del mes consultadas',
            'exito': True
        }), 200
    except Exception:
        return jsonify({
            'mensaje': 'Error al consultar las ventas del mes',
            'exito': False
        }), 500
    finally:
        if cursor is not None:
            cursor.close()


@pedidos_bp.route('/<int:idpedido>', methods=['GET'])
def leer_pedido(idpedido):
    cursor = None
    try:
        pedido = leer_pedido_bd(idpedido)
        if not pedido:
            return jsonify({
                'mensaje': 'Pedido no encontrado',
                'exito': False
            }), 404

        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT tamano, ingredientes, cantidad, precio_unitario, subtotal '
            'FROM detalle_pedido WHERE idpedido=%s',
            (idpedido,)
        )
        filas = cursor.fetchall()
        pedido['pizzas'] = [fila_a_diccionario(cursor, fila) for fila in filas]
        return jsonify({
            'pedido': pedido,
            'mensaje': 'Detalle del pedido consultado',
            'exito': True
        }), 200
    except Exception:
        return jsonify({
            'mensaje': 'Error al consultar el pedido',
            'exito': False
        }), 500
    finally:
        if cursor is not None:
            cursor.close()
