import React, { useState, useEffect } from 'react';
import { proveedoresAPI } from '../servicios/api';
import '../estilos/Proveedores.css';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        codigo: '',
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = async () => {
        try {
            setCargando(true);
            const respuesta = await proveedoresAPI.obtenerTodos();
            setProveedores(respuesta.data.datos);
            setError(null);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
            setError('No se pudieron cargar los proveedores');
        } finally {
            setCargando(false);
        }
    };

    const manejarCambio = (e) => {
        setNuevoProveedor({
            ...nuevoProveedor,
            [e.target.name]: e.target.value
        });
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        try {
            await proveedoresAPI.crear(nuevoProveedor);
            alert('✅ Proveedor creado exitosamente');
            setMostrarFormulario(false);
            setNuevoProveedor({
                codigo: '',
                nombre: '',
                contacto: '',
                telefono: '',
                email: '',
                direccion: ''
            });
            cargarProveedores();
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            alert('❌ Error al crear el proveedor');
        }
    };

    if (cargando) {
        return (
            <div className="cargando">
                <div className="spinner"></div>
                <p>Cargando proveedores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-mensaje">
                <p>❌ {error}</p>
                <button onClick={cargarProveedores}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className="proveedores-contenedor">
            <div className="proveedores-header">
                <h1>🏭 Gestión de Proveedores</h1>
                <button 
                    className="btn-nuevo"
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    {mostrarFormulario ? '✖ Cancelar' : '+ Nuevo Proveedor'}
                </button>
            </div>

            {mostrarFormulario && (
                <div className="formulario-card">
                    <h2>Registrar Nuevo Proveedor</h2>
                    <form onSubmit={manejarSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Código *</label>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={nuevoProveedor.codigo}
                                    onChange={manejarCambio}
                                    required
                                    placeholder="Ej: PROV001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={nuevoProveedor.nombre}
                                    onChange={manejarCambio}
                                    required
                                    placeholder="Nombre del proveedor"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contacto</label>
                                <input
                                    type="text"
                                    name="contacto"
                                    value={nuevoProveedor.contacto}
                                    onChange={manejarCambio}
                                    placeholder="Persona de contacto"
                                />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={nuevoProveedor.telefono}
                                    onChange={manejarCambio}
                                    placeholder="5512345678"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={nuevoProveedor.email}
                                    onChange={manejarCambio}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                            <div className="form-group form-group-full">
                                <label>Dirección</label>
                                <textarea
                                    name="direccion"
                                    value={nuevoProveedor.direccion}
                                    onChange={manejarCambio}
                                    rows="3"
                                    placeholder="Dirección completa"
                                />
                            </div>
                        </div>
                        <div className="form-botones">
                            <button type="submit" className="btn-guardar">
                                💾 Guardar Proveedor
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="proveedores-stats">
                <div className="stat-card">
                    <h3>Total Proveedores</h3>
                    <p className="stat-numero">{proveedores.length}</p>
                </div>
            </div>

            <div className="tabla-contenedor">
                <table className="tabla-proveedores">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Contacto</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            <th>Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proveedores.map(proveedor => (
                            <tr key={proveedor.id}>
                                <td><strong>{proveedor.codigo}</strong></td>
                                <td>{proveedor.nombre}</td>
                                <td>{proveedor.contacto || '-'}</td>
                                <td>{proveedor.telefono || '-'}</td>
                                <td>{proveedor.email || '-'}</td>
                                <td>{proveedor.direccion || '-'}</td>
                                <td>{new Date(proveedor.created_at).toLocaleDateString('es-MX')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Proveedores;