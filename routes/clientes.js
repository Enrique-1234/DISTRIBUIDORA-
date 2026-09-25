// routes/clientes.js
const express = require('express');
const router = express.Router();

// Ruta base para verificar funcionamiento
router.get('/', (req, res) => {
  res.json({ mensaje: 'Ruta de clientes activa' });
});

// Modificación (endpoint para registrar clientes nuevos):
router.post('/clientes/cliente', (req, res) => {
  const nuevoCliente = req.body;
  res.status(201).json({
    mensaje: 'Cliente registrado correctamente',
    cliente: nuevoCliente
  });

  // Solución al error /clientes/clientes
  router.get('/', (req, res) => {
  res.json({ mensaje: 'Listado de clientes activos' });
});

// Documentación
/**
 * @route GET /api/clientes
 * @desc Devuelve listado de clientes activos
 * @access Público
 */

// Validaciones (simula validación de datos antes de registrar un cliente)
router.post('/clientes', (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  res.status(201).json({ mensaje: 'Cliente registrado', nombre, correo });
});

const { listarClientes } = require('../controllers/clientesController');
router.get('/', listarClientes);


});


module.exports = router;
