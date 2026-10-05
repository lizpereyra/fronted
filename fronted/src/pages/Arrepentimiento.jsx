import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { revocarPedido } from "../services/api";

export default function Arrepentimiento() {
  const { estaAutenticado } = useAuth();

  const [pedidoId, setPedidoId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pedidoId) return;

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await revocarPedido(pedidoId, email);
      setResultado(res);
    } catch (err) {
      console.error("Error al revocar pedido:", err);
      setError(err.message || "No se pudo procesar la solicitud de arrepentimiento.");
    } finally {
      setLoading(false);
    }
  };

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
            Derecho de Revocación de Compra conforme a la Ley 24.240 y Disposición 954/2025 de Defensa del Consumidor
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
              <strong className="text-pastel-pink-950">10 (diez) días corridos</strong> contados a partir de la compra o entrega para revocar la operación sin costo ni necesidad de iniciar sesión (Disp. 954/2025).
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-pastel-pink-950 text-sm uppercase tracking-wider m-0">
              Pautas y Procedimiento:
            </h4>
            <ul className="list-disc list-inside space-y-2 pl-2 text-xs md:text-sm text-pastel-pink-950">
              <li>No tenés que justificar la causa ni abonar penalización alguna.</li>
              <li>Al enviar la solicitud de revocación, te otorgaremos de inmediato un <strong className="text-pastel-pink-950">código de comprobante</strong> de trámite.</li>
              <li>El trámite se procesa **SIN necesidad de estar autenticado ni poseer clave**.</li>
            </ul>
          </div>
        </div>

        {/* Dynamic Result Display */}
        {resultado && (
          <div role="status" className="mb-8 p-6 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-sm space-y-2 shadow-xs">
            <h3 className="text-base font-bold flex items-center gap-2 m-0 text-emerald-900">
              <span>✅</span>
              <span>¡Solicitud de Arrepentimiento Registrada!</span>
            </h3>
            <p className="m-0 text-xs md:text-sm">{resultado.mensaje}</p>
            {resultado.codigo && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">Código de Comprobante:</span>
                <span className="font-mono text-lg font-bold bg-white px-3 py-1 rounded-xl border border-emerald-300 inline-block mt-1">
                  {resultado.codigo}
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-8 p-4 bg-rose-50 border border-rose-300 text-rose-950 rounded-2xl text-xs md:text-sm font-medium flex items-center gap-3">
            <span>⚠️</span>
            <p className="m-0 flex-1">{error}</p>
          </div>
        )}

        {/* Public Form (Direct Access without authentication requirement) */}
        <div className="bg-pastel-pink-50 p-6 rounded-2xl border border-pastel-pink-200 space-y-4">
          <h3 className="font-bold text-pastel-pink-950 text-base m-0 border-b border-pastel-pink-200 pb-2">
            Formulario de Revocación Inmediata (Sin Sesión)
          </h3>
          <p className="text-xs text-pastel-pink-900 m-0">
            Ingresá el número de tu pedido para revocar la compra inmediatamente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                  Número / ID de Pedido *
                </label>
                <input
                  type="number"
                  required
                  value={pedidoId}
                  onChange={(e) => setPedidoId(e.target.value)}
                  placeholder="Ej: 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !pedidoId}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Procesando revocación…" : "Solicitar Revocación / Arrepentimiento"}
              </button>

              {estaAutenticado && (
                <Link
                  to="/mis-pedidos"
                  className="text-xs text-pastel-pink-900 font-bold underline hover:text-pastel-pink-950"
                >
                  Ver mis pedidos guardados
                </Link>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
