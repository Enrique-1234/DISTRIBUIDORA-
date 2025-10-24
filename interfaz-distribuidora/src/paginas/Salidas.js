import React, { useState, useEffect } from 'react';
import { salidasAPI, productosAPI, clientesAPI, almacenesAPI, usuariosAPI } from '../servicios/api';
import '../estilos/Salidas.css';

function Salidas() {
  const [salidas, setSalidas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [nuevaSalida, setNuevaSalida] = useState({
    numero_documento: '',
    fecha_salida: new Date().toISOString().split('T')[0],
    cliente_id: '',
    almacen_id: '',
    usuario_id: 1,
    tipo_salida: 'venta',
    observaciones: '',
    detalles: []
  });

  const [productoTemporal, setProductoTemporal] = useState({
    producto_id: '',
    cantidad: '',
    precio_unitario: '',
    motivo_salida: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resSalidas, resProductos, resClientes, resAlmacenes, resUsuarios] = await Promise.all([
        salidasAPI.obtenerTodas(),
        productosAPI.obtenerTodos(),
        clientesAPI.obtenerTodos(),
        almacenesAPI.obtenerTodos(),
        usuariosAPI.obtenerTodos()
      ]);

      setSalidas(resSalidas.data.datos || []);
      setProductos(resProductos.data.datos || []);
      setClientes(resClientes.data.datos || []);
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
    return `SAL-${año}${mes}-${random}`;
  };

  const abrirFormularioNuevo = () => {
    setNuevaSalida({
      numero_documento: generarNumeroDocumento(),
      fecha_salida: new Date().toISOString().split('T')[0],
      cliente_id: '',
      almacen_id: '',
      usuario_id: 1,
      tipo_salida: 'venta',
      observaciones: '',
      detalles: []
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setNuevaSalida({
      numero_documento: '',
      fecha_salida: new Date().toISOString().split('T')[0],
      cliente_id: '',
      almacen_id: '',
      usuario_id: 1,
      tipo_salida: 'venta',
      observaciones: '',
      detalles: []
    });
    setProductoTemporal({
      producto_id: '',
      cantidad: '',
      precio_unitario: '',
      motivo_salida: ''
    });
  };

  const manejarCambioSalida = (e) => {
    setNuevaSalida({
      ...nuevaSalida,
      [e.target.name]: e.target.value
    });
  };

  const manejarCambioProducto = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el producto, autocompletar precio y mostrar stock
    if (name === 'producto_id' && value) {
      const producto = productos.find(p => p.id === parseInt(value));
      setProductoTemporal({
        ...productoTemporal,
        producto_id: value,
        precio_unitario: producto.precio_venta,
        stock_disponible: producto.stock_actual
      });
    } else {
      setProductoTemporal({
        ...productoTemporal,
        [name]: value
      });
    }
  };

  const agregarProducto = () => {
    if (!productoTemporal.producto_id || !productoTemporal.cantidad || !productoTemporal.precio_unitario) {
      alert('⚠️ Completa todos los campos obligatorios del producto');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoTemporal.producto_id));
    
    // Validar stock disponible
    if (parseInt(productoTemporal.cantidad) > producto.stock_actual) {
      alert(`⚠️ Stock insuficiente. Disponible: ${producto.stock_actual}`);
      return;
    }

    const nuevoDetalle = {
      producto_id: productoTemporal.producto_id,
      cantidad: productoTemporal.cantidad,
      precio_unitario: productoTemporal.precio_unitario,
      motivo_salida: productoTemporal.motivo_salida,
      nombre_producto: producto.nombre,
      codigo_producto: producto.codigo,
      stock_disponible: producto.stock_actual,
      subtotal: parseFloat(productoTemporal.precio_unitario) * parseInt(productoTemporal.cantidad)
    };

    setNuevaSalida({
      ...nuevaSalida,
      detalles: [...nuevaSalida.detalles, nuevoDetalle]
    });

    setProductoTemporal({
      producto_id: '',
      cantidad: '',
      precio_unitario: '',
      motivo_salida: ''
    });
  };

  const eliminarProducto = (index) => {
    const nuevosDetalles = nuevaSalida.detalles.filter((_, i) => i !== index);
    setNuevaSalida({
      ...nuevaSalida,
      detalles: nuevosDetalles
    });
  };

  const calcularTotal = () => {
    return nuevaSalida.detalles.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const guardarSalida = async (e) => {
    e.preventDefault();

    if (nuevaSalida.detalles.length === 0) {
      alert('⚠️ Debes agregar al menos un producto');
      return;
    }

    try {
      await salidasAPI.crear(nuevaSalida);
      alert('✅ Salida creada exitosamente');
      cerrarFormulario();
      cargarDatos();
    } catch (error) {
      console.error('Error al crear salida:', error);
      alert('❌ Error al crear la salida: ' + (error.response?.data?.mensaje || error.message));
    }
  };

  const eliminarSalida = async (id, numeroDoc) => {
    if (!window.confirm(`¿Eliminar salida ${numeroDoc}? El stock será restaurado.`)) return;

    try {
      await salidasAPI.eliminar(id);
      alert('✅ Salida eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ ' + (error.response?.data?.mensaje || 'Error al eliminar'));
    }
  };

  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      'venta': '💰',
      'devolucion': '↩️',
      'ajuste': '⚙️'
    };
    return iconos[tipo] || '📤';
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
    <div className="salidas-contenedor">
      <div className="salidas-header">
        <h1>📤 Gestión de Salidas de Mercancía</h1>
        <button className="btn-nuevo" onClick={abrirFormularioNuevo}>
          + Nueva Salida
        </button>
      </div>

      {/* FORMULARIO NUEVA SALIDA */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="formulario-header">
            <h2>➕ Nueva Salida de Mercancía</h2>
            <button onClick={cerrarFormulario} className="btn-cerrar">✖</button>
          </div>

          <form onSubmit={guardarSalida}>
            {/* DATOS GENERALES */}
            <div className="form-grid">
              <div className="form-group">
                <label>No. Documento *</label>
                <input
                  type="text"
                  name="numero_documento"
                  value={nuevaSalida.numero_documento}
                  onChange={manejarCambioSalida}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha_salida"
                  value={nuevaSalida.fecha_salida}
                  onChange={manejarCambioSalida}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Salida *</label>
                <select
                  name="tipo_salida"
                  value={nuevaSalida.tipo_salida}
                  onChange={manejarCambioSalida}
                  required
                >
                  <option value="venta">💰 Venta</option>
                  <option value="devolucion">↩️ Devolución</option>
                  <option value="ajuste">⚙️ Ajuste de Inventario</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cliente {nuevaSalida.tipo_salida === 'venta' ? '*' : ''}</label>
                <select
                  name="cliente_id"
                  value={nuevaSalida.cliente_id}
                  onChange={manejarCambioSalida}
                  required={nuevaSalida.tipo_salida === 'venta'}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Almacén *</label>
                <select
                  name="almacen_id"
                  value={nuevaSalida.almacen_id}
                  onChange={manejarCambioSalida}
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
                  value={nuevaSalida.observaciones}
                  onChange={manejarCambioSalida}
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
                        {p.codigo} - {p.nombre} (Stock: {p.stock_actual})
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
                    max={productoTemporal.stock_disponible || 999999}
                  />
                  {productoTemporal.producto_id && (
                    <small style={{color: '#666', fontSize: '0.85rem'}}>
                      Disponible: {productoTemporal.stock_disponible}
                    </small>
                  )}
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
                  <label>Motivo</label>
                  <input
                    type="text"
                    name="motivo_salida"
                    value={productoTemporal.motivo_salida}
                    onChange={manejarCambioProducto}
                    placeholder="Ej: Venta al cliente X"
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
              {nuevaSalida.detalles.length > 0 && (
                <div className="tabla-productos-agregados">
                  <table className="tabla-salidas">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Stock Disp.</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nuevaSalida.detalles.map((detalle, index) => (
                        <tr key={index}>
                          <td>{detalle.codigo_producto}</td>
                          <td>{detalle.nombre_producto}</td>
                          <td>
                            <span style={{
                              color: detalle.stock_disponible <= 10 ? '#dc3545' : '#28a745',
                              fontWeight: 'bold'
                            }}>
                              {detalle.stock_disponible}
                            </span>
                          </td>
                          <td>{detalle.cantidad}</td>
                          <td>${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                          <td><strong>${detalle.subtotal.toFixed(2)}</strong></td>
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
                      <tr style={{backgroundColor: '#fff3cd'}}>
                        <td colSpan="5" style={{textAlign: 'right', fontWeight: 'bold'}}>
                          TOTAL:
                        </td>
                        <td style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
                          ${calcularTotal().toFixed(2)}
                        </td>
                        <td></td>
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
                💾 Guardar Salida
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div className="salidas-stats">
        <div className="stat-card">
          <h3>Total Salidas</h3>
          <p className="stat-numero">{salidas.length}</p>
        </div>
        <div className="stat-card">
          <h3>Monto Total</h3>
          <p className="stat-numero">
            ${salidas.reduce((sum, s) => sum + parseFloat(s.monto_total || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Ventas</h3>
          <p className="stat-numero">
            {salidas.filter(s => s.tipo_salida === 'venta').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Devoluciones</h3>
          <p className="stat-numero">
            {salidas.filter(s => s.tipo_salida === 'devolucion').length}
          </p>
        </div>
      </div>

      {/* TABLA DE SALIDAS */}
      <div className="tabla-contenedor">
        <table className="tabla-salidas">
          <thead>
            <tr>
              <th>No. Documento</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Almacén</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salidas.map(salida => (
              <tr key={salida.id}>
                <td><strong>{salida.numero_documento}</strong></td>
                <td>{new Date(salida.fecha_salida).toLocaleDateString('es-MX')}</td>
                <td>{salida.nombre_cliente || '-'}</td>
                <td>{salida.nombre_almacen || '-'}</td>
                <td>
                  <span className="badge-tipo">
                    {obtenerIconoTipo(salida.tipo_salida)} {salida.tipo_salida}
                  </span>
                </td>
                <td><strong>${parseFloat(salida.monto_total).toFixed(2)}</strong></td>
                <td>
                  <span className="badge badge-ok">
                    ✅ {salida.estado}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => eliminarSalida(salida.id, salida.numero_documento)}
                    className="btn-accion btn-eliminar"
                    title="Eliminar y restaurar stock"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Salidas;