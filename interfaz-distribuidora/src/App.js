import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navegacion from './componentes/Navegacion';
import Inicio from './paginas/Inicio';
import Productos from './paginas/Productos';
import Proveedores from './paginas/Proveedores';
import Entradas from './paginas/Entradas';
import Salidas from './paginas/Salidas';
import Usuarios from './paginas/Usuarios';
import './estilos/App.css';

function App() {
    return (
        <Router>
            <div className="app-contenedor">
                <Navegacion />
                <div className="contenido-principal">
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/productos" element={<Productos />} />
                        <Route path="/proveedores" element={<Proveedores />} />
                        <Route path="/entradas" element={<Entradas />} />
                        <Route path="/salidas" element={<Salidas />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;