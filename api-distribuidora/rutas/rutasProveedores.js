const express = require('express');
const enrutador = express.Router();
const { obtenerProveedores, crearProveedor } = require('../controladores/controladorProveedores');

enrutador.get('/', obtenerProveedores);
enrutador.post('/', crearProveedor);

module.exports = enrutador;