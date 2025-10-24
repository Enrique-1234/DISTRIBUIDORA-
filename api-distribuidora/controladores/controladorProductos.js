const { ejecutarConsulta } = require('../configuracion/basedatos');

// Obtener todos los productos
const obtenerTodosLosProductos = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(
            'SELECT * FROM productos ORDER BY nombre ASC'
        );
        
        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerTodosLosProductos:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener productos',
            error: error.message
        });
    }
};

// Obtener producto por ID
const obtenerProductoPorId = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        
        const resultado = await ejecutarConsulta(
            'SELECT * FROM productos WHERE id = $1',
            [id]
        );
        
        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Producto no encontrado'
            });
        }
        
        respuesta.json({
            exito: true,
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en obtenerProductoPorId:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener el producto',
            error: error.message
        });
    }
};

// Crear nuevo producto
const crearProducto = async (peticion, respuesta) => {
    try {
        const { 
            codigo, 
            nombre, 
            descripcion, 
            categoria, 
            unidad_medida, 
            precio_venta, 
            stock_minimo 
        } = peticion.body;
        
        // Validaciones
        if (!codigo || !nombre || !precio_venta) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Faltan campos obligatorios: código, nombre y precio de venta'
            });
        }
        
        const resultado = await ejecutarConsulta(
            `INSERT INTO productos 
            (codigo, nombre, descripcion, categoria, unidad_medida, precio_venta, stock_minimo) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [codigo, nombre, descripcion, categoria, unidad_medida, precio_venta, stock_minimo || 0]
        );
        
        respuesta.status(201).json({
            exito: true,
            mensaje: 'Producto creado exitosamente',
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en crearProducto:', error);
        
        // Código duplicado
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El código del producto ya existe'
            });
        }
        
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear el producto',
            error: error.message
        });
    }
};

// Actualizar producto
const actualizarProducto = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        const { 
            codigo, 
            nombre, 
            descripcion, 
            categoria, 
            unidad_medida, 
            precio_venta, 
            stock_minimo 
        } = peticion.body;
        
        const resultado = await ejecutarConsulta(
            `UPDATE productos 
            SET codigo = $1, nombre = $2, descripcion = $3, 
                categoria = $4, unidad_medida = $5, 
                precio_venta = $6, stock_minimo = $7
            WHERE id = $8 
            RETURNING *`,
            [codigo, nombre, descripcion, categoria, unidad_medida, precio_venta, stock_minimo, id]
        );
        
        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Producto no encontrado'
            });
        }
        
        respuesta.json({
            exito: true,
            mensaje: 'Producto actualizado exitosamente',
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en actualizarProducto:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

// Eliminar producto
const eliminarProducto = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        
        const resultado = await ejecutarConsulta(
            'DELETE FROM productos WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Producto no encontrado'
            });
        }
        
        respuesta.json({
            exito: true,
            mensaje: 'Producto eliminado exitosamente',
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en eliminarProducto:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

module.exports = {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};