import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pastel-pink-200 py-8 px-4 md:px-8 text-pastel-pink-900 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Rights info */}
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xl">🧁</span>
            <span className="font-bold text-pastel-pink-950 font-serif text-base">
              Dulce Vicio - Pastelería Artesanal
            </span>
          </div>
          <p className="text-xs text-pastel-pink-800 m-0">
            © {new Date().getFullYear()} Dulce Vicio. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-pastel-pink-700 m-0">
            Ley 24.240 de Defensa del Consumidor | Ley 25.326 de Protección de Datos Personales
          </p>
        </div>

        {/* Legal Action Link - Botón de arrepentimiento */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <Link
            to="/arrepentimiento"
            aria-label="Acceder al Botón de arrepentimiento para revocar compras"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 active:bg-pastel-pink-800 text-white font-bold text-xs md:text-sm shadow-xs transition-all border border-pastel-pink-700 focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 focus:ring-offset-2"
          >
            <span>↩️</span>
            <span>Botón de arrepentimiento</span>
          </Link>
          <span className="text-[10px] text-pastel-pink-700">
            Derecho de revocación dentro de los 10 días corridos sin costo
          </span>
        </div>

      </div>
    </footer>
  );
}
