import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Arrepentimiento() {
  const { estaAutenticado } = useAuth();

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-12 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-pastel-pink-200 shadow-md text-left">
        
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-pastel-pink-100">
          <span className="text-5xl select-none block mb-3">↩️</span>
          <h1 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
            Botón de Arrepentimiento
          </h1>
          <p className="text-sm text-pastel-pink-900 mt-2 font-medium m-0">
            Derecho de Revocación de Compra conforme a la Ley 24.240 y Resolución 271/2020 de Defensa del Consumidor
          </p>
        </div>

        {/* Informative Explanation */}
        <div className="space-y-4 text-sm leading-relaxed text-pastel-pink-900 mb-8">
          <div className="bg-pastel-pink-100/60 p-4 rounded-2xl border border-pastel-pink-200">
            <h3 className="font-bold text-pastel-pink-950 text-base m-0 mb-1">
              📜 ¿Qué es el derecho de arrepentimiento?
            </h3>
            <p className="m-0 text-xs md:text-sm">
              En las compras realizadas por medios electrónicos o a distancia, disponés de un plazo legal de{" "}
              <strong className="text-pastel-pink-950">10 (diez) días corridos</strong> contados a partir de la entrega del producto o de la celebración del contrato para revocar la operación sin costo ni responsabilidad alguna.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-pastel-pink-950 text-sm uppercase tracking-wider m-0">
              Pautas y Procedimiento:
            </h4>
            <ul className="list-disc list-inside space-y-2 pl-2 text-xs md:text-sm text-pastel-pink-950">
              <li>No tenés que justificar la causa ni pagar penalización alguna.</li>
              <li>Al enviar la solicitud de revocación, te otorgaremos de inmediato un <strong className="text-pastel-pink-950">código de comprobante</strong> de trámite.</li>
              <li>El producto debe ser devuelto en las mismas condiciones en las que fue recibido.</li>
              <li>Los gastos de devolución o retiro están a cargo del vendedor según lo establecido por la legislación vigente.</li>
            </ul>
          </div>
        </div>

        {/* Conditional Action Section */}
        <div className="bg-pastel-pink-50 p-6 rounded-2xl border border-pastel-pink-200 text-center space-y-4">
          {estaAutenticado ? (
            <div>
              <h3 className="font-bold text-pastel-pink-950 text-base mb-2 m-0">
                ¡Hola! Tenés una sesión activa.
              </h3>
              <p className="text-xs md:text-sm text-pastel-pink-900 mb-4 m-0">
                Podés gestionar la revocación de cualquiera de tus compras realizadas en los últimos 10 días directamente desde tu historial de pedidos.
              </p>
              <Link
                to="/mis-pedidos"
                className="inline-block px-6 py-3 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all text-decoration-none"
              >
                📦 Ir a Mis Pedidos para Revocar
              </Link>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-pastel-pink-950 text-base mb-2 m-0">
                Para solicitar la revocación de tu compra
              </h3>
              <p className="text-xs md:text-sm text-pastel-pink-900 mb-4 m-0">
                Iniciá sesión en tu cuenta para visualizar tu historial de pedidos y seleccionar la compra que deseás cancelar.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all text-decoration-none"
              >
                🔐 Iniciar Sesión para Gestionar Arrepentimiento
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
