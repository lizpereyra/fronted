import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";

import Navbar from "./components/Navbar";
import RutaProtegida from "./components/RutaProtegida";

import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import MisPedidos from "./pages/MisPedidos";
import Login from "./pages/Login";
import Registro from "./pages/Registro";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <div className="min-h-screen flex flex-col bg-pastel-pink-50 text-pastel-pink-900 selection:bg-pastel-pink-200 selection:text-pastel-pink-950">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route
                  path="/mis-pedidos"
                  element={
                    <RutaProtegida>
                      <MisPedidos />
                    </RutaProtegida>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
            
            {/* Footer */}
            <footer className="bg-white border-t border-pastel-pink-200 py-6 px-4 text-center text-xs text-pastel-pink-900">
              <p className="m-0 font-medium">
                © {new Date().getFullYear()} Dulce Vicio. Pastelería Artesanal. Ley 25.326 de Protección de Datos Personales. Todos los derechos reservados.
              </p>
            </footer>
          </div>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
