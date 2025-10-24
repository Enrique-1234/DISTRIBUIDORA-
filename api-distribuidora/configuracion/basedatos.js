const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
    host: process.env.BD_HOST || 'localhost',
    port: process.env.BD_PUERTO || 5432,
    database: process.env.BD_NOMBRE || 'distribuidora_db',
    user: process.env.BD_USUARIO || 'postgres',
    password: process.env.BD_CONTRASENA
});

// Verificar conexión al iniciar
pool.connect((error, cliente, liberar) => {
    if (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        console.error('💡 Verifica tu archivo .env y que PostgreSQL esté corriendo');
    } else {
        console.log('✅ Conexión exitosa con PostgreSQL');
        console.log(`📊 Base de datos: ${process.env.BD_NOMBRE}`);
        liberar();
    }
});

// Función auxiliar para ejecutar consultas
const ejecutarConsulta = async (textoSQL, parametros) => {
    const inicio = Date.now();
    try {
        const resultado = await pool.query(textoSQL, parametros);
        const duracion = Date.now() - inicio;
        console.log(`⚡ Consulta ejecutada en ${duracion}ms - ${resultado.rowCount} filas`);
        return resultado;
    } catch (error) {
        console.error('❌ Error en consulta SQL:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    ejecutarConsulta
};