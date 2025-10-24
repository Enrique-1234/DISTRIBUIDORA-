import React from 'react';
import '../estilos/Inicio.css';

function Inicio() {
    return (
        <div className="inicio-contenedor">
            <div className="bienvenida">
                <h1>Bienvenido al Sistema de Distribuidora</h1>
                <p>Gestiona tu inventario, entradas, salidas y más de forma eficiente</p>
            </div>

            <div className="tarjetas-grid">
                <div className="tarjeta">
                    <div className="tarjeta-icono">📦</div>
                    <h3>Productos</h3>
                    <p>Gestiona el catálogo de productos</p>
                </div>

                <div className="tarjeta">
                    <div className="tarjeta-icono">🏭</div>
                    <h3>Proveedores</h3>
                    <p>Administra tus proveedores</p>
                </div>

                <div className="tarjeta">
                    <div className="tarjeta-icono">📥</div>
                    <h3>Entradas</h3>
                    <p>Registra entradas de mercancía</p>
                </div>

                <div className="tarjeta">
                    <div className="tarjeta-icono">📤</div>
                    <h3>Salidas</h3>
                    <p>Control de salidas de productos</p>
                </div>

                <div className="tarjeta">
                    <div className="tarjeta-icono">📊</div>
                    <h3>Reportes</h3>
                    <p>Visualiza estadísticas del negocio</p>
                </div>

                <div className="tarjeta">
                    <div className="tarjeta-icono">👥</div>
                    <h3>Usuarios</h3>
                    <p>Gestión de usuarios del sistema</p>
                </div>
            </div>
        </div>
    );
}

export default Inicio;