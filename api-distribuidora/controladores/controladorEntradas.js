const { ejecutarConsulta, pool } = require('../configuracion/basedatos');

// Obtener todas las entradas
const obtenerEntradas = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(`
            SELECT 
                e.*,
                p.nombre as nombre_proveedor,
                u.nombre_completo as nombre_usuario,
                a.nombre as nombre_almacen
            FROM entradas_mercancia e
            LEFT JOIN proveedores p ON e.proveedor_id = p.id
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN almacenes a ON e.almacen_id = a.id
            ORDER BY e.fecha_entrada DESC
        `);

        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerEntradas:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener entradas',
            error: error.message
        });
    }
};

// Obtener entrada por ID con sus detalles
const obtenerEntradaPorId = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;

        // Obtener entrada
        const entrada = await ejecutarConsulta(
            `SELECT e.*, p.nombre as nombre_proveedor, a.nombre as nombre_almacen
             FROM entradas_mercancia e
             LEFT JOIN proveedores p ON e.proveedor_id = p.id
             LEFT JOIN almacenes a ON e.almacen_id = a.id
             WHERE e.id = $1`,
            [id]
        );

        if (entrada.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Entrada no encontrada'
            });
        }

        // Obtener detalles de la entrada
        const detalles = await ejecutarConsulta(
            `SELECT d.*, pr.nombre as nombre_producto, pr.codigo as codigo_producto
             FROM detalle_entrada d
             JOIN productos pr ON d.producto_id = pr.id
             WHERE d.entrada_id = $1`,
            [id]
        );

        respuesta.json({
            exito: true,
            datos: {
                ...entrada.rows[0],
                detalles: detalles.rows
            }
        });
    } catch (error) {
        console.error('Error en obtenerEntradaPorId:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener la entrada',
            error: error.message
        });
    }
};

// Crear nueva entrada con detalles
const crearEntrada = async (peticion, respuesta) => {
    const cliente = await pool.connect();
    
    try {
        const {
            numero_documento,
            fecha_entrada,
            proveedor_id,
            almacen_id,
            usuario_id,
            observaciones,
            detalles // Array de productos
        } = peticion.body;

        // Validaciones
        if (!numero_documento || !fecha_entrada || !detalles || detalles.length === 0) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Faltan campos obligatorios o no hay productos'
            });
        }

        // Iniciar transacción
        await cliente.query('BEGIN');

        // Calcular monto total
        const monto_total = detalles.reduce((sum, item) => 
            sum + (parseFloat(item.precio_unitario) * parseInt(item.cantidad)), 0
        );

        // Insertar entrada
        const resultadoEntrada = await cliente.query(
            `INSERT INTO entradas_mercancia 
             (numero_documento, fecha_entrada, proveedor_id, almacen_id, usuario_id, monto_total, estado, observaciones)
             VALUES ($1, $2, $3, $4, $5, $6, 'borrador', $7)
             RETURNING *`,
            [numero_documento, fecha_entrada, proveedor_id, almacen_id, usuario_id, monto_total, observaciones]
        );

        const entrada_id = resultadoEntrada.rows[0].id;

        // Insertar detalles
        for (const detalle of detalles) {
            await cliente.query(
                `INSERT INTO detalle_entrada 
                 (entrada_id, producto_id, cantidad, precio_unitario, lote, fecha_vencimiento)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [entrada_id, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, 
                 detalle.lote, detalle.fecha_vencimiento]
            );
        }

        // Confirmar transacción
        await cliente.query('COMMIT');

        respuesta.status(201).json({
            exito: true,
            mensaje: 'Entrada creada exitosamente',
            datos: resultadoEntrada.rows[0]
        });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error en crearEntrada:', error);
        
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El número de documento ya existe'
            });
        }

        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear la entrada',
            error: error.message
        });
    } finally {
        cliente.release();
    }
};

// Actualizar estado de entrada
const actualizarEstadoEntrada = async (peticion, respuesta) => {
    const cliente = await pool.connect();

    try {
        const { id } = peticion.params;
        const { estado } = peticion.body;

        const estadosValidos = ['borrador', 'validacion', 'autorizada', 'proceso', 'completada', 'rechazada', 'cancelada'];
        
        if (!estadosValidos.includes(estado)) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Estado no válido'
            });
        }

        await cliente.query('BEGIN');

        // Si el estado es 'completada', actualizar stock de productos
        if (estado === 'completada') {
            const detalles = await cliente.query(
                'SELECT * FROM detalle_entrada WHERE entrada_id = $1',
                [id]
            );

            for (const detalle of detalles.rows) {
                await cliente.query(
                    `UPDATE productos 
                     SET stock_actual = stock_actual + $1 
                     WHERE id = $2`,
                    [detalle.cantidad, detalle.producto_id]
                );

                // Registrar movimiento
                await cliente.query(
                    `INSERT INTO movimientos 
                     (tipo_movimiento, producto_id, cantidad_anterior, cantidad_nueva, usuario_id, observaciones)
                     SELECT 'entrada', $1, stock_actual - $2, stock_actual, $3, 'Entrada completada #' || $4
                     FROM productos WHERE id = $1`,
                    [detalle.producto_id, detalle.cantidad, peticion.body.usuario_id || 1, id]
                );
            }
        }

        // Actualizar estado
        const resultado = await cliente.query(
            'UPDATE entradas_mercancia SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (resultado.rows.length === 0) {
            await cliente.query('ROLLBACK');
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Entrada no encontrada'
            });
        }

        await cliente.query('COMMIT');

        respuesta.json({
            exito: true,
            mensaje: `Estado actualizado a: ${estado}`,
            datos: resultado.rows[0]
        });

    } catch (error) {
        await cliente.query('ROLLBACK');
        console.error('Error en actualizarEstadoEntrada:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al actualizar el estado',
            error: error.message
        });
    } finally {
        cliente.release();
    }
};

// Eliminar entrada
const eliminarEntrada = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;

        // Verificar que no esté completada
        const verificar = await ejecutarConsulta(
            'SELECT estado FROM entradas_mercancia WHERE id = $1',
            [id]
        );

        if (verificar.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Entrada no encontrada'
            });
        }

        if (verificar.rows[0].estado === 'completada') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'No se puede eliminar una entrada completada'
            });
        }

        const resultado = await ejecutarConsulta(
            'DELETE FROM entradas_mercancia WHERE id = $1 RETURNING *',
            [id]
        );

        respuesta.json({
            exito: true,
            mensaje: 'Entrada eliminada exitosamente',
            datos: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en eliminarEntrada:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar la entrada',
            error: error.message
        });
    }
};

module.exports = {
    obtenerEntradas,
    obtenerEntradaPorId,
    crearEntrada,
    actualizarEstadoEntrada,
    eliminarEntrada
};