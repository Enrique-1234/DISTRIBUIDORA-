const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
require('./configuracion/basedatos');

// Importar rutas
const rutasProductos = require('./rutas/rutasProductos');
const rutasProveedores = require('./rutas/rutasProveedores');
const rutasEntradas = require('./rutas/rutasEntradas');
const rutasSalidas = require('./rutas/rutasSalidas');
const rutasUsuarios = require('./rutas/rutasUsuarios');
const rutasAlmacenes = require('./rutas/rutasAlmacenes');
const rutasClientes = require('./rutas/rutasClientes');

// Crear aplicación Express
const aplicacion = express();

// Middlewares (intermediarios)
aplicacion.use(cors()); // Permitir peticiones desde otros orígenes
aplicacion.use(express.json()); // Parsear JSON en el cuerpo de peticiones
aplicacion.use(express.urlencoded({ extended: true })); // Parsear formularios

// Configurar rutas de la API
aplicacion.use('/api/productos', rutasProductos);
aplicacion.use('/api/proveedores', rutasProveedores);
aplicacion.use('/api/entradas', rutasEntradas);
aplicacion.use('/api/salidas', rutasSalidas);
aplicacion.use('/api/usuarios', rutasUsuarios);
aplicacion.use('/api/almacenes', rutasAlmacenes);
aplicacion.use('/api/clientes', rutasClientes);

// Ruta raíz (página de inicio de la API)
aplicacion.get('/', (peticion, respuesta) => {
    respuesta.json({
        mensaje: '🚀 API del Sistema de Distribuidora',
        version: '1.0.0',
        estado: 'En línea',
        endpoints: {
            productos: '/api/productos',
            proveedores: '/api/proveedores',
            entradas: '/api/entradas',
            salidas: '/api/salidas',
            usuarios: '/api/usuarios'
        },
        documentacion: 'Próximamente...'
    });
});

// Manejo de rutas no encontradas (Error 404)
aplicacion.use((peticion, respuesta) => {
    respuesta.status(404).json({
        exito: false,
        mensaje: 'Ruta no encontrada',
        ruta_solicitada: peticion.url
    });
});

// Manejo de errores globales
aplicacion.use((error, peticion, respuesta, siguiente) => {
    console.error('❌ Error en el servidor:', error);
    respuesta.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
    });
});

// Iniciar servidor
const PUERTO = process.env.PUERTO || 3000;
aplicacion.listen(PUERTO, () => {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║  🚀 SERVIDOR INICIADO CORRECTAMENTE       ║
║                                            ║
║  📍 URL: http://localhost:${PUERTO}            ║
║  🕐 Fecha: ${new Date().toLocaleString('es-MX')}  ║
║                                            ║
║  📚 ENDPOINTS DISPONIBLES:                ║
║  ├─ GET  /api/productos                   ║
║  ├─ GET  /api/proveedores                 ║
║  ├─ GET  /api/entradas                    ║
║  ├─ GET  /api/salidas                     ║
║  └─ GET  /api/usuarios                    ║
║                                            ║
║  💡 Presiona Ctrl+C para detener          ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
});