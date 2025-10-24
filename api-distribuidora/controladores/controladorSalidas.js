const { ejecutarConsulta, pool } = require('../configuracion/basedatos');

// Obtener todas las salidas
const obtenerSalidas = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(`
            SELECT 
                s.*,
                c.nombre as nombre_cliente,
                u.nombre_completo as nombre_usuario,
                a.nombre as nombre_almacen
            FROM salidas_mercancia s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            LEFT JOIN almacenes a ON s.almacen_id = a.id
            ORDER BY s.fecha_salida DESC
        `);

        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerSalidas:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener salidas',
            error: error.message
        });
    }
};

// Obtener salida por ID con sus detalles
const obtenerSalidaPorId = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;

        // Obtener salida
        const salida = await ejecutarConsulta(
            `SELECT s.*, c.nombre as nombre_cliente, a.nombre as nombre_almacen
             FROM salidas_mercancia s
             LEFT JOIN clientes c ON s.cliente_id = c.id
             LEFT JOIN almacenes a ON s.almacen_id = a.id
             WHERE s.id = $1`,
            [id]
        );

        if (salida.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Salida no encontrada'
            });
        }

        // Obtener detalles de la salida
        const detalles = await ejecutarConsulta(
            `SELECT d.*, pr.nombre as nombre_producto, pr.codigo as codigo_producto
             FROM detalle_salida d
             JOIN productos pr ON d.producto_id = pr.id
             WHERE d.salida_id = $1`,
            [id]
        );

        respuesta.json({
            exito: true,
            datos: {
                ...salida.rows[0],
                detalles: detalles.rows
            }
        });
    } catch (error) {
        console.error('Error en obtenerSalidaPorId:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener la salida',
            error: error.message
        });
    }
};

// Crear nueva salida con detalles
const crearSalida = async (peticion, respuesta) => {
    const cliente = await pool.connect();
    
    try {
        const {
            numero_documento,
            fecha_salida,
            cliente_id,
            almacen_id,
            usuario_id,
            tipo_salida,
            observaciones,
            detalles // Array de productos
        } = peticion.body;

        // Validaciones
        if (!numero_documento || !fecha_salida || !tipo_salida || !detalles || detalles.length === 0) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Faltan campos obligatorios o no hay productos'
            });
        }

        // Iniciar transacción
        await cliente.query('BEGIN');

        // Validar stock disponible antes de crear la salida
        for (const detalle of detalles) {
            const productoActual = await cliente.query(
                'SELECT stock_actual FROM productos WHERE id = $1',
                [detalle.producto_id]
            );

            if (productoActual.rows.length === 0) {
                await cliente.query('ROLLBACK');
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: `Producto con ID ${detalle.producto_id} no encontrado`
                });
            }

            const stockDisponible = productoActual.rows[0].stock_actual;
            
            if (stockDisponible < detalle.cantidad) {
                await cliente.query('ROLLBACK');
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: `Stock insuficiente para el producto. Disponible: ${stockDisponible}, Solicitado: ${detalle.cantidad}`
                });
            }
        }

        // Calcular monto total
        const monto_total = detalles.reduce((sum, item) => 
            sum + (parseFloat(item.precio_unitario) * parseInt(item.cantidad)), 0
        );

        // Insertar salida
        const resultadoSalida = await cliente.query(
            `INSERT INTO salidas_mercancia 
             (numero_documento, fecha_salida, cliente_id, almacen_id, usuario_id, tipo_salida, monto_total, estado, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'completada', $8)
             RETURNING *`,
            [numero_documento, fecha_salida, cliente_id, almacen_id, usuario_id, tipo_salida, monto_total, observaciones]
        );

        const salida_id = resultadoSalida.rows[0].id;

        // Insertar detalles y actualizar stock
        for (const detalle of detalles) {
            // Insertar detalle
            await cliente.query(
                `INSERT INTO detalle_salida 
                 (salida_id, producto_id, cantidad, precio_unitario, motivo_salida)
                 VALUES ($1, $2, $3, $4, $5)`,
                [salida_id, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, detalle.motivo_salida]
            );

            // Actualizar stock del producto
            await cliente.query(
                `UPDATE productos 
                 SET stock_actual = stock_actual - $1 
                 WHERE id = $2`,
                [detalle.cantidad, detalle.producto_id]
            );

            // Registrar movimiento
            await cliente.query(
                `INSERT INTO movimientos 
                 (tipo_movimiento, producto_id, cantidad_anterior, cantidad_nueva, usuario_id, observaciones)
                 SELECT 'salida', $1, stock_actual + $2, stock_actual, $3, 'Salida #' || $4
                 FROM productos WHERE id = $1`,
                [detalle.producto_id, detalle.cantidad, usuario_id || 1, salida_id]
            );
        }

        // Confirmar transacción
        await cliente.query('COMMIT');

        respuesta.status(201).json({
            exito: true,
            mensaje: 'Salida creada exitosamente',
            datos: resultadoSalida.rows[0]
        });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error en crearSalida:', error);
        
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El número de documento ya existe'
            });
        }

        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear la salida',
            error: error.message
        });
    } finally {
        cliente.release();
    }
};

// Eliminar salida (solo si no afectó inventario)
const eliminarSalida = async (peticion, respuesta) => {
    const cliente = await pool.connect();
    
    try {
        const { id } = peticion.params;

        await cliente.query('BEGIN');

        // Obtener detalles de la salida
        const detalles = await cliente.query(
            'SELECT * FROM detalle_salida WHERE salida_id = $1',
            [id]
        );

        // Restaurar el stock
        for (const detalle of detalles.rows) {
            await cliente.query(
                `UPDATE productos 
                 SET stock_actual = stock_actual + $1 
                 WHERE id = $2`,
                [detalle.cantidad, detalle.producto_id]
            );
        }

        // Eliminar la salida (esto también eliminará los detalles por CASCADE)
        const resultado = await cliente.query(
            'DELETE FROM salidas_mercancia WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            await cliente.query('ROLLBACK');
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Salida no encontrada'
            });
        }

        await cliente.query('COMMIT');

        respuesta.json({
            exito: true,
            mensaje: 'Salida eliminada exitosamente y stock restaurado',
            datos: resultado.rows[0]
        });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error en eliminarSalida:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar la salida',
            error: error.message
        });
    } finally {
        cliente.release();
    }
};

module.exports = {
    obtenerSalidas,
    obtenerSalidaPorId,
    crearSalida,
    eliminarSalida
};