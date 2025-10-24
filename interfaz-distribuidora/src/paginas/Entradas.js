import React, { useState, useEffect } from 'react';
import { entradasAPI, productosAPI, proveedoresAPI, almacenesAPI, usuariosAPI } from '../servicios/api';
import '../estilos/Entradas.css';

function Entradas() {
  const [entradas, setEntradas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [nuevaEntrada, setNuevaEntrada] = useState({
    numero_documento: '',
    fecha_entrada: new Date().toISOString().split('T')[0],
    proveedor_id: '',
    almacen_id: '',
    usuario_id: 1,
    observaciones: '',
    detalles: []
  });

  const [productoTemporal, setProductoTemporal] = useState({
    producto_id: '',
    cantidad: '',
    precio_unitario: '',
    lote: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resEntradas, resProductos, resProveedores, resAlmacenes, resUsuarios] = await Promise.all([
        entradasAPI.obtenerTodas(),
        productosAPI.obtenerTodos(),
        proveedoresAPI.obtenerTodos(),
        almacenesAPI.obtenerTodos(),
        usuariosAPI.obtenerTodos()
      ]);

      setEntradas(resEntradas.data.datos || []);
      setProductos(resProductos.data.datos || []);
      setProveedores(resProveedores.data.datos || []);
      setAlmacenes(resAlmacenes.data.datos || []);
      setUsuarios(resUsuarios.data.datos || []);
      setError(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('No se pudieron cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const generarNumeroDocumento = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `ENT-${año}${mes}-${random}`;
  };

  const abrirFormularioNuevo = () => {
    setNuevaEntrada({
      numero_documento: generarNumeroDocumento(),
      fecha_entrada: new Date().toISOString().split('T')[0],
      proveedor_id: '',
      almacen_id: '',
      usuario_id: 1,
      observaciones: '',
      detalles: []
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setNuevaEntrada({
      numero_documento: '',
      fecha_entrada: new Date().toISOString().split('T')[0],
      proveedor_id: '',
      almacen_id: '',
      usuario_id: 1,
      observaciones: '',
      detalles: []
    });
    setProductoTemporal({
      producto_id: '',
      cantidad: '',
      precio_unitario: '',
      lote: '',
      fecha_vencimiento: ''
    });
  };

  const manejarCambioEntrada = (e) => {
    setNuevaEntrada({
      ...nuevaEntrada,
      [e.target.name]: e.target.value
    });
  };

  const manejarCambioProducto = (e) => {
    const { name, value } = e.target;
    setProductoTemporal({
      ...productoTemporal,
      [name]: value
    });
  };

  const agregarProducto = () => {
    if (!productoTemporal.producto_id || !productoTemporal.cantidad || !productoTemporal.precio_unitario) {
      alert('⚠️ Completa todos los campos obligatorios del producto');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoTemporal.producto_id));
    
    const nuevoDetalle = {
      ...productoTemporal,
      nombre_producto: producto.nombre,
      codigo_producto: producto.codigo,
      subtotal: parseFloat(productoTemporal.precio_unitario) * parseInt(productoTemporal.cantidad)
    };

    setNuevaEntrada({
      ...nuevaEntrada,
      detalles: [...nuevaEntrada.detalles, nuevoDetalle]
    });

    setProductoTemporal({
      producto_id: '',
      cantidad: '',
      precio_unitario: '',
      lote: '',
      fecha_vencimiento: ''
    });
  };

  const eliminarProducto = (index) => {
    const nuevosDetalles = nuevaEntrada.detalles.filter((_, i) => i !== index);
    setNuevaEntrada({
      ...nuevaEntrada,
      detalles: nuevosDetalles
    });
  };

  const calcularTotal = () => {
    return nuevaEntrada.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const guardarEntrada = async (e) => {
    e.preventDefault();

    if (nuevaEntrada.detalles.length === 0) {
      alert('⚠️ Debes agregar al menos un producto');
      return;
    }

    try {
      await entradasAPI.crear(nuevaEntrada);
      alert('✅ Entrada creada exitosamente');
      cerrarFormulario();
      cargarDatos();
    } catch (error) {
      console.error('Error al crear entrada:', error);
      alert('❌ Error al crear la entrada: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    try {
      await entradasAPI.actualizarEstado(id, nuevoEstado, 1);
      alert(`✅ Estado actualizado a: ${nuevoEstado}`);
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error al cambiar el estado');
    }
  };

  const eliminarEntrada = async (id, numeroDoc) => {
    if (!window.confirm(`¿Eliminar entrada ${numeroDoc}?`)) return;

    try {
      await entradasAPI.eliminar(id);
      alert('✅ Entrada eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ ' + (error.response?.data?.mensaje || 'Error al eliminar'));
    }
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      'borrador': 'estado-borrador',
      'validacion': 'estado-validacion',
      'autorizada': 'estado-autorizada',
      'proceso': 'estado-proceso',
      'completada': 'estado-completada',
      'rechazada': 'estado-rechazada',
      'cancelada': 'estado-cancelada'
    };
    return colores[estado] || 'estado-borrador';
  };

  const obtenerIconoEstado = (estado) => {
    const iconos = {
      'borrador': '📝',
      'validacion': '⏳',
      'autorizada': '✅',
      'proceso': '⚙️',
      'completada': '✔️',
      'rechazada': '❌',
      'cancelada': '🚫'
    };
    return iconos[estado] || '📝';
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-mensaje">
        <p>❌ {error}</p>
        <button onClick={cargarDatos}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="entradas-contenedor">
      <div className="entradas-header">
        <h1>📥 Gestión de Entradas de Mercancía</h1>
        <button className="btn-nuevo" onClick={abrirFormularioNuevo}>
          + Nueva Entrada
        </button>
      </div>

      {/* FORMULARIO NUEVA ENTRADA */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="formulario-header">
            <h2>➕ Nueva Entrada de Mercancía</h2>
            <button onClick={cerrarFormulario} className="btn-cerrar">✖</button>
          </div>

          <form onSubmit={guardarEntrada}>
            {/* DATOS GENERALES */}
            <div className="form-grid">
              <div className="form-group">
                <label>No. Documento *</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={nuevaEntrada.numero_documento}
                  onChange={manejarCambioEntrada}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha_entrada"
                  value={nuevaEntrada.fecha_entrada}
                  onChange={manejarCambioEntrada}
                  required
                />
              </div>

              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  name="proveedor_id"
                  value={nuevaEntrada.proveedor_id}
                  onChange={manejarCambioEntrada}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Almacén *</label>
                <select
                  name="almacen_id"
                  value={nuevaEntrada.almacen_id}
                  onChange={manejarCambioEntrada}
                  required
                >
                  <option value="">Seleccionar almacén</option>
                  {almacenes.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group form-group-full">
                <label>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={nuevaEntrada.observaciones}
                  onChange={manejarCambioEntrada}
                  rows="2"
                />
              </div>
            </div>

            {/* AGREGAR PRODUCTOS */}
            <div className="seccion-productos">
              <h3>📦 Agregar Productos</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    name="producto_id"
                    value={productoTemporal.producto_id}
                    onChange={manejarCambioProducto}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={productoTemporal.cantidad}
                    onChange={manejarCambioProducto}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Precio Unitario *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_unitario"
                    value={productoTemporal.precio_unitario}
                    onChange={manejarCambioProducto}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Lote</label>
                  <input
                    type="text"
                    name="lote"
                    value={productoTemporal.lote}
                    onChange={manejarCambioProducto}
                  />
                </div>

                <div className="form-group">
                  <label>F. Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={productoTemporal.fecha_vencimiento}
                    onChange={manejarCambioProducto}
                  />
                </div>

                <div className="form-group" style={{display: 'flex', alignItems: 'flex-end'}}>
                  <button
                    type="button"
                    onClick={agregarProducto}
                    className="btn-agregar-producto"
                  >
                    ➕ Agregar
                  </button>
                </div>
              </div>

              {/* TABLA DE PRODUCTOS AGREGADOS */}
              {nuevaEntrada.detalles.length > 0 && (
                <div className="tabla-productos-agregados">
                  <table className="tabla-entradas">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        <th>Lote</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nuevaEntrada.detalles.map((detalle, index) => (
                        <tr key={index}>
                          <td>{detalle.codigo_producto}</td>
                          <td>{detalle.nombre_producto}</td>
                          <td>{detalle.cantidad}</td>
                          <td>${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                          <td><strong>${detalle.subtotal.toFixed(2)}</strong></td>
                          <td>{detalle.lote || '-'}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => eliminarProducto(index)}
                              className="btn-accion btn-eliminar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr style={{backgroundColor: '#f0f8ff'}}>
                        <td colSpan="4" style={{textAlign: 'right', fontWeight: 'bold'}}>
                          TOTAL:
                        </td>
                        <td style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
                          ${calcularTotal().toFixed(2)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* BOTONES FORMULARIO */}
            <div className="form-botones">
              <button type="button" onClick={cerrarFormulario} className="btn-cancelar">
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">
                💾 Guardar Entrada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="entradas-stats">
        <div className="stat-card">
          <h3>Total Entradas</h3>
          <p className="stat-numero">{entradas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Monto Total</h3>
          <p className="stat-numero">
            ${entradas.reduce((sum, e) => sum + parseFloat(e.monto_total || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completadas</h3>
          <p className="stat-numero">
            {entradas.filter(e => e.estado === 'completada').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Pendientes</h3>
          <p className="stat-numero">
            {entradas.filter(e => e.estado !== 'completada' && e.estado !== 'cancelada').length}
          </p>
        </div>
      </div>

      {/* TABLA DE ENTRADAS */}
      <div className="tabla-contenedor">
        <table className="tabla-entradas">
          <thead>
            <tr>
              <th>No. Documento</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Almacén</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map(entrada => (
              <tr key={entrada.id}>
                <td><strong>{entrada.numero_documento}</strong></td>
                <td>{new Date(entrada.fecha_entrada).toLocaleDateString('es-MX')}</td>
                <td>{entrada.nombre_proveedor || '-'}</td>
                <td>{entrada.nombre_almacen || '-'}</td>
                <td><strong>${parseFloat(entrada.monto_total).toFixed(2)}</strong></td>
                <td>
                  <span className={`badge-estado ${obtenerColorEstado(entrada.estado)}`}>
                    {obtenerIconoEstado(entrada.estado)} {entrada.estado}
                  </span>
                </td>
                <td>
                  <div className="acciones-entrada">
                    {entrada.estado === 'borrador' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(entrada.id, 'validacion')}
                          className="btn-accion"
                          title="Enviar a validación"
                        >
                          ⏳
                        </button>
                        <button
                          onClick={() => eliminarEntrada(entrada.id, entrada.numero_documento)}
                          className="btn-accion btn-eliminar"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {entrada.estado === 'validacion' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(entrada.id, 'autorizada')}
                          className="btn-accion"
                          title="Autorizar"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => cambiarEstado(entrada.id, 'rechazada')}
                          className="btn-accion"
                          title="Rechazar"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {entrada.estado === 'autorizada' && (
                      <button
                        onClick={() => cambiarEstado(entrada.id, 'completada')}
                        className="btn-accion"
                        title="Completar (actualiza inventario)"
                      >
                        ✔️
                      </button>
                    )}
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

export default Entradas;