const express = require('express');
const enrutador = express.Router();
const {
    obtenerSalidas,
    obtenerSalidaPorId,
    crearSalida,
    eliminarSalida
} = require('../controladores/controladorSalidas');

enrutador.get('/', obtenerSalidas);
enrutador.get('/:id', obtenerSalidaPorId);
enrutador.post('/', crearSalida);
enrutador.delete('/:id', eliminarSalida);

module.exports = enrutador;