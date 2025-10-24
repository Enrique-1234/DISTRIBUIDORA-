const express = require('express');
const enrutador = express.Router();
const { obtenerAlmacenes } = require('../controladores/controladorAlmacenes');

enrutador.get('/', obtenerAlmacenes);

module.exports = enrutador;