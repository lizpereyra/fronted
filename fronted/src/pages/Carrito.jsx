import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { crearPedido } from "../services/api";

export default function Carrito() {
  const { items, agregar, quitar, vaciar, total } = useCarrito();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleConfirmar = async () => {
    // 1. Logical Guard / Double-click barrier
    if (enviando) return;
    if (items.length === 0) return;

    if (!estaAutenticado) {
      navigate("/login", { state: { statePath: "/carrito" } });
      return;
    }

    // 2. Set loading state
    setEnviando(true);
    setError(null);

    try {
      // 3. Send order payload containing ONLY producto_id and cantidad
      await crearPedido(items);
      // 4. Clean cart and redirect to order history
      vaciar();
      navigate("/mis-pedidos");
    } catch (err) {
      console.error("Error en checkout:", err);
      // Displays HTTP 409 stock conflict or 401 expiration error message directly from backend
      setError(err.message || "Error al procesar el pedido. Por favor intenta nuevamente.");
    } finally {
      // 5. Always reset sending state
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-10 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
              Tu Carrito Dulce
            </h2>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Revisa tus delicias seleccionadas antes de confirmar la compra.
            </p>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={vaciar}
              disabled={enviando}
              className="text-xs text-rose-700 hover:text-rose-900 hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              Vaciar Carrito
            </button>
          )}
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div role="alert" className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-sm font-medium flex items-center gap-3 shadow-xs">
            <span className="text-xl">⚠️</span>
            <p className="flex-1 m-0">{error}</p>
            <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* Cart Contents */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-pastel-pink-200 shadow-xs max-w-md mx-auto my-8">
            <span className="text-6xl mb-4 block select-none">🛒</span>
            <h3 className="text-xl font-bold text-pastel-pink-950 font-serif mb-2">Tu carrito está vacío</h3>
            <p className="text-sm text-pastel-pink-900 mb-6">
              Explora nuestro catálogo y agrega las más ricas porciones de pastelería.
            </p>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all inline-block text-decoration-none"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div 
                  key={item.producto.id} 
                  className="bg-white rounded-2xl p-4 border border-pastel-pink-200 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-pastel-pink-100 rounded-xl flex items-center justify-center text-2xl select-none shrink-0">
                      🍰
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-pastel-pink-950 m-0">{item.producto.nombre}</h4>
                      <p className="text-xs text-pastel-pink-900 font-semibold m-0 mt-0.5">
                        {formatCurrency(item.producto.precio_final)} c/u
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 border border-pastel-pink-300 rounded-xl bg-pastel-pink-50 p-1">
                      <button
                        onClick={() => {
                          if (item.cantidad > 1) {
                            agregar(item.producto, -1);
                          } else {
                            quitar(item.producto.id);
                          }
                        }}
                        disabled={enviando}
                        className="w-7 h-7 rounded-lg bg-white text-pastel-pink-950 font-bold hover:bg-pastel-pink-200 text-sm flex items-center justify-center border border-pastel-pink-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-pastel-pink-950">{item.cantidad}</span>
                      <button
                        onClick={() => agregar(item.producto, 1)}
                        disabled={enviando || item.cantidad >= item.producto.stock}
                        className="w-7 h-7 rounded-lg bg-white text-pastel-pink-950 font-bold hover:bg-pastel-pink-200 text-sm flex items-center justify-center border border-pastel-pink-200 disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-sm font-bold text-pastel-pink-950">
                        {formatCurrency(item.producto.precio_final * item.cantidad)}
                      </div>
                      <button
                        onClick={() => quitar(item.producto.id)}
                        disabled={enviando}
                        className="text-[11px] text-rose-700 hover:text-rose-900 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Order Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs sticky top-20">
                <h3 className="text-lg font-bold text-pastel-pink-950 font-serif mb-4 border-b border-pastel-pink-100 pb-3">
                  Resumen de Compra
                </h3>

                <div className="space-y-2 mb-6 text-sm text-pastel-pink-900">
                  <div className="flex justify-between">
                    <span>Cantidad de ítems:</span>
                    <span className="font-bold">{items.reduce((acc, i) => acc + i.cantidad, 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-pastel-pink-100 pt-2 text-base font-bold text-pastel-pink-950">
                    <span>Total Final:</span>
                    <span className="text-pastel-pink-900 text-xl">{formatCurrency(total)}</span>
                  </div>
                </div>

                {!estaAutenticado && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-950 text-xs p-3 rounded-xl mb-4 font-medium">
                    📢 Debes <Link to="/login" className="font-bold underline text-amber-950">iniciar sesión</Link> para confirmar tu pedido.
                  </div>
                )}

                {/* Confirm Purchase Button with Logical Guard & Dynamic Text */}
                <button
                  onClick={handleConfirmar}
                  disabled={enviando || items.length === 0}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-xs transition-all cursor-pointer ${
                    enviando || items.length === 0
                      ? "bg-pastel-pink-300 cursor-not-allowed"
                      : "bg-pastel-pink-600 hover:bg-pastel-pink-700 active:scale-95 shadow-md"
                  }`}
                >
                  {enviando ? "Confirmando…" : "Confirmar compra"}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
