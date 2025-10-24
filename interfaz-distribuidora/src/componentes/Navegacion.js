import React from 'react';
import { Link } from 'react-router-dom';
import '../estilos/Navegacion.css';

function Navegacion() {
    return (
        <nav className="navegacion">
            <div className="nav-contenedor">
                <div className="nav-logo">
                    <h1>📦 Sistema Distribuidora</h1>
                </div>
                <ul className="nav-menu">
                    <li><Link to="/">🏠 Inicio</Link></li>
                    <li><Link to="/productos">📦 Productos</Link></li>
                    <li><Link to="/proveedores">🏭 Proveedores</Link></li>
                    <li><Link to="/entradas">📥 Entradas</Link></li>
                    <li><Link to="/salidas">📤 Salidas</Link></li>
                    <li><Link to="/usuarios">👥 Usuarios</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navegacion;