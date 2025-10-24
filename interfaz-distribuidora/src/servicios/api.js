import axios from 'axios';

// URL base de la API (tu backend)
const URL_BASE = 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: URL_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== PRODUCTOS ====================
export const productosAPI = {
  obtenerTodos: () => api.get('/productos'),
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  crear: (datos) => api.post('/productos', datos),
  actualizar: (id, datos) => api.put(`/productos/${id}`, datos),
  eliminar: (id) => api.delete(`/productos/${id}`)
};

// ==================== PROVEEDORES ====================
export const proveedoresAPI = {
  obtenerTodos: () => api.get('/proveedores'),
  obtenerPorId: (id) => api.get(`/proveedores/${id}`),
  crear: (datos) => api.post('/proveedores', datos),
  actualizar: (id, datos) => api.put(`/proveedores/${id}`, datos),
  eliminar: (id) => api.delete(`/proveedores/${id}`)
};

// ==================== CLIENTES ====================
export const clientesAPI = {
  obtenerTodos: () => api.get('/clientes'),
  obtenerPorId: (id) => api.get(`/clientes/${id}`),
  crear: (datos) => api.post('/clientes', datos),
  actualizar: (id, datos) => api.put(`/clientes/${id}`, datos),
  eliminar: (id) => api.delete(`/clientes/${id}`)
};

// ==================== ALMACENES ====================
export const almacenesAPI = {
  obtenerTodos: () => api.get('/almacenes'),
  obtenerPorId: (id) => api.get(`/almacenes/${id}`),
  crear: (datos) => api.post('/almacenes', datos),
  actualizar: (id, datos) => api.put(`/almacenes/${id}`, datos),
  eliminar: (id) => api.delete(`/almacenes/${id}`)
};

// ==================== ENTRADAS ====================
// Servicios para Entradas (ACTUALIZAR)
export const entradasAPI = {
  obtenerTodas: () => api.get('/entradas'),
  obtenerPorId: (id) => api.get(`/entradas/${id}`),
  crear: (datos) => api.post('/entradas', datos),
  actualizarEstado: (id, estado, usuario_id) => 
    api.patch(`/entradas/${id}/estado`, { estado, usuario_id }),
  eliminar: (id) => api.delete(`/entradas/${id}`)
};

 
// ==================== SALIDAS ====================
export const salidasAPI = {
  obtenerTodas: () => api.get('/salidas'),
  obtenerPorId: (id) => api.get(`/salidas/${id}`),
  obtenerConDetalles: (id) => api.get(`/salidas/${id}/detalles`),
  crear: (datos) => api.post('/salidas', datos),
  actualizar: (id, datos) => api.put(`/salidas/${id}`, datos),
  eliminar: (id) => api.delete(`/salidas/${id}`)
};

// ==================== USUARIOS ====================
export const usuariosAPI = {
  obtenerTodos: () => api.get('/usuarios'),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`),
  crear: (datos) => api.post('/usuarios', datos),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
};

// ==================== DETALLE ENTRADA ====================
export const detalleEntradaAPI = {
  crear: (datos) => api.post('/detalle-entrada', datos),
  actualizar: (id, datos) => api.put(`/detalle-entrada/${id}`, datos),
  eliminar: (id) => api.delete(`/detalle-entrada/${id}`)
};

// ==================== DETALLE SALIDA ====================
export const detalleSalidaAPI = {
  crear: (datos) => api.post('/detalle-salida', datos),
  actualizar: (id, datos) => api.put(`/detalle-salida/${id}`, datos),
  eliminar: (id) => api.delete(`/detalle-salida/${id}`)
};

// ==================== MOVIMIENTOS (AUDITORÍA) ====================
export const movimientosAPI = {
  obtenerTodos: () => api.get('/movimientos'),
  obtenerPorProducto: (productoId) => api.get(`/movimientos/producto/${productoId}`),
  obtenerPorUsuario: (usuarioId) => api.get(`/movimientos/usuario/${usuarioId}`)
};

export default api;