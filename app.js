const express = require('express');
const app = express();

// Importar la ruta de clientes
const clientesRouter = require('./routes/clientes');

// Usar la ruta bajo el prefijo /api/clientes
app.use('/api/clientes', clientesRouter);

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
