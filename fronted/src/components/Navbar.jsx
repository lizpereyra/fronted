import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";

export default function Navbar() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glassmorphism-dark border-b border-pastel-pink-200 px-4 md:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Header / Logo points to / (Home) */}
        <Link to="/" className="flex items-center gap-2 group text-decoration-none">
          <span className="text-3xl select-none group-hover:scale-110 transition-transform">🧁</span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-pastel-pink-950 font-serif tracking-wide m-0 leading-none">
              Dulce Vicio
            </h1>
            <p className="text-[10px] text-pastel-pink-800 uppercase tracking-widest font-semibold font-sans m-0">
              Pastelería Artesanal
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Inicio Option -> / */}
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              isActive("/")
                ? "bg-pastel-pink-600 text-white shadow-xs"
                : "text-pastel-pink-950 hover:bg-pastel-pink-100"
            }`}
          >
            🏠 Inicio
          </Link>

          {/* Catálogo Option -> /catalogo */}
          <Link
            to="/catalogo"
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              isActive("/catalogo")
                ? "bg-pastel-pink-600 text-white shadow-xs"
                : "text-pastel-pink-950 hover:bg-pastel-pink-100"
            }`}
          >
            🍰 Catálogo
          </Link>

          {estaAutenticado && (
            <Link
              to="/mis-pedidos"
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                isActive("/mis-pedidos")
                  ? "bg-pastel-pink-600 text-white shadow-xs"
                  : "text-pastel-pink-950 hover:bg-pastel-pink-100"
              }`}
            >
              📦 Mis Pedidos
            </Link>
          )}

          {/* Cart Button */}
          <Link
            to="/carrito"
            className="relative px-3.5 py-2 rounded-xl bg-pastel-pink-100 hover:bg-pastel-pink-200 text-pastel-pink-950 border border-pastel-pink-300 font-semibold text-xs md:text-sm transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Carrito</span>
            {cantidadTotal > 0 && (
              <span className="bg-pink-600 text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-xs">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {estaAutenticado ? (
            <div className="flex items-center gap-2 border-l border-pastel-pink-300 pl-3 ml-1">
              <span className="hidden lg:inline text-xs font-semibold text-pastel-pink-950 truncate max-w-[120px]">
                👤 {usuario?.nombre || usuario?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white text-xs md:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              Ingresar
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
