const express = require('express');
const enrutador = express.Router();
const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    cambiarEstadoUsuario,
    eliminarUsuario
} = require('../controladores/controladorUsuarios');

enrutador.get('/', obtenerUsuarios);
enrutador.get('/:id', obtenerUsuarioPorId);
enrutador.post('/', crearUsuario);
enrutador.put('/:id', actualizarUsuario);
enrutador.patch('/:id/password', cambiarPassword);
enrutador.patch('/:id/estado', cambiarEstadoUsuario);
enrutador.delete('/:id', eliminarUsuario);

module.exports = enrutador;