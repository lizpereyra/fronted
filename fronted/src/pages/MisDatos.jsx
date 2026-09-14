import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { getMisDatos, exportarMisDatos, eliminarMiCuenta } from "../services/api";

export default function MisDatos() {
  const { usuario, cerrarSesion } = useAuth();
  const { vaciar } = useCarrito();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmacionTexto, setConfirmacionTexto] = useState("");
  const [exportando, setExportando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMisDatos();
      setDatos(res);
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
      setError(err.message || "Error al obtener la información de tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportarMisDatos();
    } catch (err) {
      alert(`Error al exportar tus datos: ${err.message}`);
    } finally {
      setExportando(false);
    }
  };

  const handleEliminarCuenta = async (e) => {
    e.preventDefault();
    if (confirmacionTexto.trim() !== "ELIMINAR") return;

    const seguro = window.confirm(
      "¿Estás seguro/a de solicitar la baja definitiva de tu cuenta? Tus datos identificativos serán anonimizados."
    );
    if (!seguro) return;

    setEliminando(true);
    try {
      await eliminarMiCuenta();
      vaciar();
      cerrarSesion();
      alert("Tu cuenta ha sido eliminada y anonimizada con éxito.");
      navigate("/", { replace: true });
    } catch (err) {
      alert(`Error al procesar la baja de cuenta: ${err.message}`);
      setEliminando(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/D";
    try {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const u = datos?.usuario || usuario;
  const c = datos?.consentimiento;
  const pedidosList = datos?.pedidos || [];
  const revocacionesList = datos?.revocaciones || [];

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-10 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
              Mis Datos Personales
            </h1>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Gestión de privacidad, consentimiento e historial legal conforme a la Ley 25.326.
            </p>
          </div>

          <button
            onClick={handleExportar}
            disabled={exportando}
            className="px-4 py-2.5 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 active:bg-pastel-pink-800 text-white font-bold text-xs md:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>📥</span>
            <span>{exportando ? "Exportando…" : "Exportar mis datos (.json)"}</span>
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl p-10 text-center border border-pastel-pink-200 shadow-xs max-w-md mx-auto">
            <div className="inline-block animate-spin text-4xl mb-3">🌸</div>
            <p className="text-base font-bold text-pastel-pink-950 m-0">Cargando tus datos…</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-950 p-6 rounded-3xl text-center shadow-xs">
            <span className="text-3xl mb-2 block">⚠️</span>
            <p className="text-sm font-semibold m-0">{error}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Section 1: Personal Data & Consent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* Personal Info Card */}
              <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-pastel-pink-950 font-serif m-0 border-b border-pastel-pink-100 pb-3 flex items-center gap-2">
                  <span>👤</span>
                  <span>Información Personal</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Nombre Completo:
                    </span>
                    <span className="font-semibold text-pastel-pink-950">
                      {u?.nombre || "No especificado"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Correo Electrónico:
                    </span>
                    <span className="font-semibold text-pastel-pink-950">
                      {u?.email || "No especificado"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Fecha de Alta:
                    </span>
                    <span className="font-semibold text-pastel-pink-950">
                      {formatDate(u?.creado_en || u?.fecha_alta)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consent Card */}
              <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-pastel-pink-950 font-serif m-0 border-b border-pastel-pink-100 pb-3 flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Consentimiento del Tratamiento</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Estado de Consentimiento:
                    </span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                      ✅ {c?.estado || "Aceptado / Vigente"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Fecha de Otorgamiento:
                    </span>
                    <span className="font-semibold text-pastel-pink-950">
                      {formatDate(c?.fecha || u?.creado_en)}
                    </span>
                  </div>

                  <p className="text-xs text-pastel-pink-800 m-0 pt-2 border-t border-pastel-pink-100">
                    Consentimiento otorgado conforme a la Ley 25.326 para la prestación de servicios comerciales y envío de facturación.
                  </p>
                </div>
              </div>

            </div>

            {/* Section 2: Order & Revocation History */}
            <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs text-left space-y-4">
              <h3 className="text-lg font-bold text-pastel-pink-950 font-serif m-0 border-b border-pastel-pink-100 pb-3 flex items-center gap-2">
                <span>📋</span>
                <span>Historial de Pedidos y Revocaciones</span>
              </h3>

              {revocacionesList.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider m-0">
                    Solicitudes de Revocación Registradas:
                  </h4>
                  <div className="divide-y divide-pastel-pink-100">
                    {revocacionesList.map((rev, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center text-xs md:text-sm">
                        <span>Código: <strong className="font-mono">{rev.codigo}</strong> (Pedido #{rev.pedido_id})</span>
                        <span className="text-pastel-pink-800">{formatDate(rev.fecha)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-pastel-pink-800 m-0">
                  No tenés solicitudes de revocación pendientes o registradas en tu historial.
                </p>
              )}

              {pedidosList.length > 0 && (
                <div className="pt-3 border-t border-pastel-pink-100">
                  <p className="text-xs text-pastel-pink-900 m-0">
                    Registramos <strong>{pedidosList.length}</strong> pedido(s) asociados a tu cuenta.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Deletion of Account (Baja de cuenta) */}
            <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 text-left space-y-4 shadow-xs">
              <div className="border-b border-rose-200 pb-3">
                <h3 className="text-lg font-bold text-rose-950 font-serif m-0 flex items-center gap-2">
                  <span>🚨</span>
                  <span>Eliminar mi Cuenta</span>
                </h3>
              </div>

              <p className="text-xs md:text-sm text-rose-900 leading-relaxed m-0">
                Al solicitar la baja, tus datos identificativos (nombre, correo electrónico y clave) serán completamente{" "}
                <strong className="text-rose-950">anonimizados</strong> en nuestras bases de datos. Conservaremos únicamente los registros comerciales y fiscales de tus pedidos para el cumplimiento de obligaciones legales de contabilidad.
              </p>

              <form onSubmit={handleEliminarCuenta} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-rose-950 uppercase tracking-wider mb-1">
                    Escribí la palabra <span className="underline font-mono">ELIMINAR</span> para confirmar la baja:
                  </label>
                  <input
                    type="text"
                    value={confirmacionTexto}
                    onChange={(e) => setConfirmacionTexto(e.target.value)}
                    placeholder="ELIMINAR"
                    className="w-full max-w-xs px-4 py-2 rounded-xl border border-rose-300 bg-white text-rose-950 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={confirmacionTexto.trim() !== "ELIMINAR" || eliminando}
                  className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {eliminando ? "Eliminando cuenta…" : "Confirmar y Dar de Baja mi Cuenta"}
                </button>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
