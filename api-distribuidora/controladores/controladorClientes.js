const { ejecutarConsulta } = require('../configuracion/basedatos');

const obtenerClientes = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(
            'SELECT * FROM clientes ORDER BY nombre ASC'
        );

        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerClientes:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener clientes',
            error: error.message
        });
    }
};

const crearCliente = async (peticion, respuesta) => {
    try {
        const { codigo, nombre, rfc, telefono, email, direccion, limite_credito } = peticion.body;

        if (!codigo || !nombre) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Código y nombre son obligatorios'
            });
        }

        const resultado = await ejecutarConsulta(
            `INSERT INTO clientes (codigo, nombre, rfc, telefono, email, direccion, limite_credito)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [codigo, nombre, rfc, telefono, email, direccion, limite_credito || 0]
        );

        respuesta.status(201).json({
            exito: true,
            mensaje: 'Cliente creado exitosamente',
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en crearCliente:', error);
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El código del cliente ya existe'
            });
        }
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear el cliente',
            error: error.message
        });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente
};