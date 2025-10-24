const { ejecutarConsulta } = require('../configuracion/basedatos');

const obtenerProveedores = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(
            'SELECT * FROM proveedores ORDER BY nombre ASC'
        );
        
        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerProveedores:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener proveedores',
            error: error.message
        });
    }
};

const crearProveedor = async (peticion, respuesta) => {
    try {
        const { codigo, nombre, contacto, telefono, email, direccion } = peticion.body;
        
        if (!codigo || !nombre) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Código y nombre son obligatorios'
            });
        }
        
        const resultado = await ejecutarConsulta(
            'INSERT INTO proveedores (codigo, nombre, contacto, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [codigo, nombre, contacto, telefono, email, direccion]
        );
        
        respuesta.status(201).json({
            exito: true,
            mensaje: 'Proveedor creado exitosamente',
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en crearProveedor:', error);
        
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El código del proveedor ya existe'
            });
        }
        
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear el proveedor',
            error: error.message
        });
    }
};

module.exports = { 
    obtenerProveedores, 
    crearProveedor 
};