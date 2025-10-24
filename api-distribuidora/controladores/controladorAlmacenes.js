const { ejecutarConsulta } = require('../configuracion/basedatos');

const obtenerAlmacenes = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(
            'SELECT * FROM almacenes ORDER BY nombre ASC'
        );

        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerAlmacenes:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener almacenes',
            error: error.message
        });
    }
};

module.exports = { obtenerAlmacenes };