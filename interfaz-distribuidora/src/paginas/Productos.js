import React, { useState, useEffect } from 'react';
import { productosAPI } from '../servicios/api';
import '../estilos/Productos.css';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidad_medida: 'pieza',
    precio_venta: '',
    stock_minimo: '',
    stock_actual: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await productosAPI.obtenerTodos();
      setProductos(respuesta.data.datos);
      setError(null);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setProductoActual({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidad_medida: 'pieza',
      precio_venta: '',
      stock_minimo: '',
      stock_actual: ''
    });
    setModoEdicion(false);
  };

  const abrirFormularioNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (producto) => {
    setProductoActual(producto);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const manejarCambio = (e) => {
    setProductoActual({
      ...productoActual,
      [e.target.name]: e.target.value
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await productosAPI.actualizar(productoActual.id, productoActual);
        alert('✅ Producto actualizado exitosamente');
      } else {
        await productosAPI.crear(productoActual);
        alert('✅ Producto creado exitosamente');
      }
      cerrarFormulario();
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('❌ Error al guardar el producto');
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      try {
        await productosAPI.eliminar(id);
        alert('✅ Producto eliminado exitosamente');
        cargarProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('❌ Error al eliminar el producto');
      }
    }
  };

  if (cargando) {
    return (
      <div className="cargando">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-mensaje">
        <p>❌ {error}</p>
        <button onClick={cargarProductos}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="productos-contenedor">
      <div className="productos-header">
        <h1>📦 Gestión de Productos</h1>
        <button className="btn-nuevo" onClick={abrirFormularioNuevo}>
          + Nuevo Producto
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="formulario-header">
            <h2>{modoEdicion ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h2>
            <button className="btn-cerrar" onClick={cerrarFormulario}>✖</button>
          </div>
          <form onSubmit={manejarSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  name="codigo"
                  value={productoActual.codigo}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej: PROD001"
                  disabled={modoEdicion}
                />
              </div>

              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={productoActual.nombre}
                  onChange={manejarCambio}
                  required
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <input
                  type="text"
                  name="categoria"
                  value={productoActual.categoria}
                  onChange={manejarCambio}
                  required
                  placeholder="Ej: Electrónica, Alimentos"
                />
              </div>

              <div className="form-group">
                <label>Unidad de Medida *</label>
                <select
                  name="unidad_medida"
                  value={productoActual.unidad_medida}
                  onChange={manejarCambio}
                  required
                >
                  <option value="pieza">Pieza</option>
                  <option value="kg">Kilogramo</option>
                  <option value="litro">Litro</option>
                  <option value="caja">Caja</option>
                  <option value="paquete">Paquete</option>
                  <option value="metro">Metro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Precio Venta *</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio_venta"
                  value={productoActual.precio_venta}
                  onChange={manejarCambio}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Stock Mínimo *</label>
                <input
                  type="number"
                  name="stock_minimo"
                  value={productoActual.stock_minimo}
                  onChange={manejarCambio}
                  required
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Stock Actual *</label>
                <input
                  type="number"
                  name="stock_actual"
                  value={productoActual.stock_actual}
                  onChange={manejarCambio}
                  required
                  placeholder="0"
                />
              </div>

              <div className="form-group form-group-full">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={productoActual.descripcion}
                  onChange={manejarCambio}
                  rows="3"
                  placeholder="Descripción detallada del producto"
                />
              </div>
            </div>

            <div className="form-botones">
              <button type="button" className="btn-cancelar" onClick={cerrarFormulario}>
                Cancelar
              </button>
              <button type="submit" className="btn-guardar">
                💾 {modoEdicion ? 'Actualizar' : 'Guardar'} Producto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="productos-stats">
        <div className="stat-card">
          <h3>Total Productos</h3>
          <p className="stat-numero">{productos.length}</p>
        </div>
        <div className="stat-card">
          <h3>Stock Total</h3>
          <p className="stat-numero">
            {productos.reduce((sum, p) => sum + (parseInt(p.stock_actual) || 0), 0)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Valor Inventario</h3>
          <p className="stat-numero">
            ${productos.reduce((sum, p) => sum + (parseFloat(p.precio_venta) * parseInt(p.stock_actual) || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Productos Bajo Stock</h3>
          <p className="stat-numero">
            {productos.filter(p => p.stock_actual <= p.stock_minimo).length}
          </p>
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id}>
                <td><strong>{producto.codigo}</strong></td>
                <td>{producto.nombre}</td>
                <td>{producto.categoria}</td>
                <td>${parseFloat(producto.precio_venta).toFixed(2)}</td>
                <td>{producto.stock_actual}</td>
                <td>{producto.stock_minimo}</td>
                <td>
                  <span className={`badge ${
                    producto.stock_actual <= producto.stock_minimo
                      ? 'badge-peligro'
                      : 'badge-ok'
                  }`}>
                    {producto.stock_actual <= producto.stock_minimo
                      ? '⚠️ Bajo'
                      : '✅ OK'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-accion btn-editar" 
                    onClick={() => abrirFormularioEditar(producto)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-accion btn-eliminar" 
                    onClick={() => eliminarProducto(producto.id, producto.nombre)}
                    title="Eliminar"
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

export default Productos;