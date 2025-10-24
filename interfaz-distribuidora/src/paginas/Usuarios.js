import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../servicios/api';
import '../estilos/Usuarios.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarCambiarPassword, setMostrarCambiarPassword] = useState(false);
  
  const [usuarioActual, setUsuarioActual] = useState({
    username: '',
    password: '',
    nombre_completo: '',
    rol: 'almacenista',
    activo: true
  });

  const [passwordData, setPasswordData] = useState({
    usuario_id: null,
    nueva_password: '',
    confirmar_password: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const respuesta = await usuariosAPI.obtenerTodos();
      setUsuarios(respuesta.data.datos || []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setUsuarioActual({
      username: '',
      password: '',
      nombre_completo: '',
      rol: 'almacenista',
      activo: true
    });
    setModoEdicion(false);
  };

  const abrirFormularioNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (usuario) => {
    setUsuarioActual({
      ...usuario,
      password: '' // No mostrar password
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuarioActual({
      ...usuarioActual,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!modoEdicion && usuarioActual.password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      if (modoEdicion) {
        await usuariosAPI.actualizar(usuarioActual.id, usuarioActual);
        alert('✅ Usuario actualizado exitosamente');
      } else {
        await usuariosAPI.crear(usuarioActual);
        alert('✅ Usuario creado exitosamente');
      }
      cerrarFormulario();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('❌ Error: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estás seguro de ${accion} este usuario?`)) return;

    try {
      await usuariosAPI.cambiarEstado(id, nuevoEstado);
      alert(`✅ Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error al cambiar el estado');
    }
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) return;

    try {
      await usuariosAPI.eliminar(id);
      alert('✅ Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('❌ Error: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const abrirCambiarPassword = (usuario) => {
    setPasswordData({
      usuario_id: usuario.id,
      usuario_nombre: usuario.nombre_completo,
      nueva_password: '',
      confirmar_password: ''
    });
    setMostrarCambiarPassword(true);
  };

  const cerrarCambiarPassword = () => {
    setMostrarCambiarPassword(false);
    setPasswordData({
      usuario_id: null,
      nueva_password: '',
      confirmar_password: ''
    });
  };

  const manejarCambioPassword = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const guardarPassword = async (e) => {
    e.preventDefault();

    if (passwordData.nueva_password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.nueva_password !== passwordData.confirmar_password) {
      alert('⚠️ Las contraseñas no coinciden');
      return;
    }

    try {
      await usuariosAPI.cambiarPassword(passwordData.usuario_id, passwordData.nueva_password);
      alert('✅ Contraseña actualizada exitosamente');
      cerrarCambiarPassword();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('❌ Error al cambiar la contraseña');
    }
  };

  const obtenerColorRol = (rol) => {
    const colores = {
      'administrador': 'rol-admin',
      'gerente': 'rol-gerente',
      'almacenista': 'rol-almacenista'
    };
    return colores[rol] || 'rol-almacenista';
  };

  const obtenerIconoRol = (rol) => {
    const iconos = {
      'administrador': '👑',
      'gerente': '👔',
      'almacenista': '📦'
    };
    return iconos[rol] || '👤';
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-mensaje">
        <p>❌ {error}</p>
        <button onClick={cargarUsuarios}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="usuarios-contenedor">
      <div className="usuarios-header">
        <h1>👥 Gestión de Usuarios</h1>
        <button className="btn-nuevo" onClick={abrirFormularioNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      {/* FORMULARIO USUARIO */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="formulario-header">
            <h2>{modoEdicion ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
            <button className="btn-cerrar" onClick={cerrarFormulario}>✖</button>
          </div>

          <form onSubmit={manejarSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de Usuario *</label>
                <input
                  type="text"
                  name="username"
                  value={usuarioActual.username}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej: juanperez"
                  disabled={modoEdicion}
                />
              </div>

              {!modoEdicion && (
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={usuarioActual.password}
                    onChange={manejarCambio}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength="6"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={usuarioActual.nombre_completo}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="rol"
                  value={usuarioActual.rol}
                  onChange={manejarCambio}
                  required
                >
                  <option value="almacenista">📦 Almacenista</option>
                  <option value="gerente">👔 Gerente</option>
                  <option value="administrador">👑 Administrador</option>
                </select>
              </div>

              {modoEdicion && (
                <div className="form-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input
                      type="checkbox"
                      name="activo"
                      checked={usuarioActual.activo}
                      onChange={manejarCambio}
                    />
                    Usuario Activo
                  </label>
                </div>
              )}
            </div>

            <div className="form-botones">
              <button type="button" className="btn-cancelar" onClick={cerrarFormulario}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">
                💾 {modoEdicion ? 'Actualizar' : 'Guardar'} Usuario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {mostrarCambiarPassword && (
        <div className="modal-overlay" onClick={cerrarCambiarPassword}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="formulario-header">
              <h2>🔐 Cambiar Contraseña</h2>
              <button className="btn-cerrar" onClick={cerrarCambiarPassword}>✖</button>
            </div>
            <p style={{marginBottom: '1rem', color: '#666'}}>
              Usuario: <strong>{passwordData.usuario_nombre}</strong>
            </p>
            <form onSubmit={guardarPassword}>
              <div className="form-group">
                <label>Nueva Contraseña *</label>
                <input
                  type="password"
                  name="nueva_password"
                  value={passwordData.nueva_password}
                  onChange={manejarCambioPassword}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña *</label>
                <input
                  type="password"
                  name="confirmar_password"
                  value={passwordData.confirmar_password}
                  onChange={manejarCambioPassword}
                  required
                  placeholder="Repetir contraseña"
                  minLength="6"
                />
              </div>

              <div className="form-botones">
                <button type="button" className="btn-cancelar" onClick={cerrarCambiarPassword}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  💾 Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="usuarios-stats">
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p className="stat-numero">{usuarios.length}</p>
        </div>
        <div className="stat-card">
          <h3>Activos</h3>
          <p className="stat-numero">
            {usuarios.filter(u => u.activo).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Administradores</h3>
          <p className="stat-numero">
            {usuarios.filter(u => u.rol === 'administrador').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Inactivos</h3>
          <p className="stat-numero">
            {usuarios.filter(u => !u.activo).length}
          </p>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="tabla-contenedor">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td><strong>{usuario.username}</strong></td>
                <td>{usuario.nombre_completo}</td>
                <td>
                  <span className={`badge-rol ${obtenerColorRol(usuario.rol)}`}>
                    {obtenerIconoRol(usuario.rol)} {usuario.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${usuario.activo ? 'badge-ok' : 'badge-peligro'}`}>
                    {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                </td>
                <td>{new Date(usuario.created_at).toLocaleDateString('es-MX')}</td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                    <button
                      className="btn-accion btn-editar"
                      onClick={() => abrirFormularioEditar(usuario)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-accion"
                      onClick={() => abrirCambiarPassword(usuario)}
                      title="Cambiar contraseña"
                      style={{color: '#ffa500'}}
                    >
                      🔐
                    </button>
                    <button
                      className="btn-accion"
                      onClick={() => cambiarEstado(usuario.id, usuario.activo)}
                      title={usuario.activo ? 'Desactivar' : 'Activar'}
                      style={{color: usuario.activo ? '#6c757d' : '#28a745'}}
                    >
                      {usuario.activo ? '🚫' : '✅'}
                    </button>
                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => eliminarUsuario(usuario.id, usuario.nombre_completo)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usuarios;