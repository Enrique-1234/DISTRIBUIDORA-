const { ejecutarConsulta } = require('../configuracion/basedatos');
//const bcrypt = require('bcrypt'); // Para encriptar contraseñas

// Obtener todos los usuarios
const obtenerUsuarios = async (peticion, respuesta) => {
    try {
        const resultado = await ejecutarConsulta(
            'SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios ORDER BY nombre_completo'
        );

        respuesta.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerUsuarios:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;

        const resultado = await ejecutarConsulta(
            'SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        respuesta.json({
            exito: true,
            datos: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en obtenerUsuarioPorId:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al obtener el usuario',
            error: error.message
        });
    }
};

// Crear nuevo usuario
const crearUsuario = async (peticion, respuesta) => {
    try {
        const { username, password, nombre_completo, rol } = peticion.body;

        // Validaciones
        if (!username || !password || !nombre_completo || !rol) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Validar que el rol sea válido
        const rolesValidos = ['administrador', 'gerente', 'almacenista'];
        if (!rolesValidos.includes(rol)) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'Rol no válido. Debe ser: administrador, gerente o almacenista'
            });
        }

        // Encriptar contraseña (Por simplicidad, usaremos hash básico)
        // En producción deberías usar bcrypt
        const passwordHash = password; // Simplificado para el proyecto académico

        const resultado = await ejecutarConsulta(
            `INSERT INTO usuarios (username, password, nombre_completo, rol, activo)
             VALUES ($1, $2, $3, $4, true)
             RETURNING id, username, nombre_completo, rol, activo, created_at`,
            [username, passwordHash, nombre_completo, rol]
        );

        respuesta.status(201).json({
            exito: true,
            mensaje: 'Usuario creado exitosamente',
            datos: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en crearUsuario:', error);

        // Username duplicado
        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El nombre de usuario ya existe'
            });
        }

        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    }
};

// Actualizar usuario
const actualizarUsuario = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        const { username, nombre_completo, rol, activo } = peticion.body;

        // Validar que el rol sea válido si se está actualizando
        if (rol) {
            const rolesValidos = ['administrador', 'gerente', 'almacenista'];
            if (!rolesValidos.includes(rol)) {
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: 'Rol no válido'
                });
            }
        }

        const resultado = await ejecutarConsulta(
            `UPDATE usuarios 
             SET username = $1, nombre_completo = $2, rol = $3, activo = $4
             WHERE id = $5
             RETURNING id, username, nombre_completo, rol, activo, created_at`,
            [username, nombre_completo, rol, activo, id]
        );

        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        respuesta.json({
            exito: true,
            mensaje: 'Usuario actualizado exitosamente',
            datos: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en actualizarUsuario:', error);

        if (error.code === '23505') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'El nombre de usuario ya existe'
            });
        }

        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

// Cambiar contraseña
const cambiarPassword = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        const { nueva_password } = peticion.body;

        if (!nueva_password || nueva_password.length < 6) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // En producción usar bcrypt
        const passwordHash = nueva_password;

        const resultado = await ejecutarConsulta(
            'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id, username',
            [passwordHash, id]
        );

        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        respuesta.json({
            exito: true,
            mensaje: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en cambiarPassword:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al cambiar la contraseña',
            error: error.message
        });
    }
};

// Activar/Desactivar usuario
const cambiarEstadoUsuario = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;
        const { activo } = peticion.body;

        const resultado = await ejecutarConsulta(
            `UPDATE usuarios 
             SET activo = $1 
             WHERE id = $2
             RETURNING id, username, nombre_completo, rol, activo`,
            [activo, id]
        );

        if (resultado.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        respuesta.json({
            exito: true,
            mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
            datos: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en cambiarEstadoUsuario:', error);
        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al cambiar el estado del usuario',
            error: error.message
        });
    }
};

// Eliminar usuario
const eliminarUsuario = async (peticion, respuesta) => {
    try {
        const { id } = peticion.params;

        // Verificar que no sea el último administrador
        const adminCount = await ejecutarConsulta(
            "SELECT COUNT(*) as total FROM usuarios WHERE rol = 'administrador' AND activo = true"
        );

        const usuarioActual = await ejecutarConsulta(
            'SELECT rol FROM usuarios WHERE id = $1',
            [id]
        );

        if (usuarioActual.rows.length === 0) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        if (usuarioActual.rows[0].rol === 'administrador' && parseInt(adminCount.rows[0].total) <= 1) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'No se puede eliminar el último administrador activo'
            });
        }

        const resultado = await ejecutarConsulta(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id, username, nombre_completo',
            [id]
        );

        respuesta.json({
            exito: true,
            mensaje: 'Usuario eliminado exitosamente',
            datos: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en eliminarUsuario:', error);
        
        // Si hay referencias en otras tablas
        if (error.code === '23503') {
            return respuesta.status(400).json({
                exito: false,
                mensaje: 'No se puede eliminar el usuario porque tiene registros asociados'
            });
        }

        respuesta.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar el usuario',
            error: error.message
        });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    cambiarEstadoUsuario,
    eliminarUsuario
};