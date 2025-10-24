const express = require('express');
const enrutador = express.Router();
const {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controladores/controladorProductos');

// Rutas para gestión de productos
enrutador.get('/', obtenerTodosLosProductos);
enrutador.get('/:id', obtenerProductoPorId);
enrutador.post('/', crearProducto);
enrutador.put('/:id', actualizarProducto);
enrutador.delete('/:id', eliminarProducto);

module.exports = enrutador;