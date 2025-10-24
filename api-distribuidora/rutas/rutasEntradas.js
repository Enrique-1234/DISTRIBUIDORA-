const express = require('express');
const enrutador = express.Router();
const {
    obtenerEntradas,
    obtenerEntradaPorId,
    crearEntrada,
    actualizarEstadoEntrada,
    eliminarEntrada
} = require('../controladores/controladorEntradas');

enrutador.get('/', obtenerEntradas);
enrutador.get('/:id', obtenerEntradaPorId);
enrutador.post('/', crearEntrada);
enrutador.patch('/:id/estado', actualizarEstadoEntrada);
enrutador.delete('/:id', eliminarEntrada);

module.exports = enrutador;