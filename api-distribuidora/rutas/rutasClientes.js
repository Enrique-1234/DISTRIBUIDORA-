const express = require('express');
const enrutador = express.Router();
const { obtenerClientes, crearCliente } = require('../controladores/controladorClientes');

enrutador.get('/', obtenerClientes);
enrutador.post('/', crearCliente);

module.exports = enrutador;