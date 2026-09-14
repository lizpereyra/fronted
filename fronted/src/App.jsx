import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RutaProtegida from "./components/RutaProtegida";

import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import MisPedidos from "./pages/MisPedidos";
import Arrepentimiento from "./pages/Arrepentimiento";
import MisDatos from "./pages/MisDatos";
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
                <Route path="/arrepentimiento" element={<Arrepentimiento />} />
                <Route
                  path="/mis-pedidos"
                  element={
                    <RutaProtegida>
                      <MisPedidos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/pedidos"
                  element={
                    <RutaProtegida>
                      <MisPedidos />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/mis-datos"
                  element={
                    <RutaProtegida>
                      <MisDatos />
                    </RutaProtegida>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
            
            {/* Global Footer */}
            <Footer />
          </div>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
