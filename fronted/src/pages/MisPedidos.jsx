import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMisPedidos } from "../services/api";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMisPedidos();
      setPedidos(data || []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setError(err.message || "Ocurrió un error al consultar tus compras.");
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-10 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
              Historial de Pedidos
            </h2>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Consulta tus compras realizadas y el estado de cada pedido.
            </p>
          </div>

          <button
            onClick={fetchPedidos}
            className="px-3 py-2 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-900 border border-pastel-pink-300 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Recargar Pedidos"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* State 1: Loading */}
        {loading && (
          <div className="bg-white rounded-3xl p-10 text-center border border-pastel-pink-200 shadow-xs max-w-md mx-auto my-8">
            <div className="inline-block animate-spin text-4xl mb-3">🌸</div>
            <p className="text-base font-bold text-pastel-pink-950 m-0">Cargando tus compras…</p>
          </div>
        )}

        {/* State 2: Error */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-950 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-xs my-8">
            <span className="text-4xl mb-3 block">⚠️</span>
            <p role="alert" className="text-sm font-semibold m-0 mb-4">{error}</p>
            <button
              onClick={fetchPedidos}
              className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* State 3: Empty List */}
        {!loading && !error && pedidos.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-pastel-pink-200 shadow-xs max-w-md mx-auto my-8">
            <span className="text-5xl mb-4 block select-none">📦</span>
            <p className="text-base font-bold text-pastel-pink-950 mb-2 m-0">Todavía no compraste nada.</p>
            <p className="text-xs text-pastel-pink-900 mb-6 m-0">
              Revisa nuestro catálogo e inicia tu primera orden en Dulce Vicio.
            </p>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all inline-block text-decoration-none"
            >
              Ver Catálogo
            </Link>
          </div>
        )}

        {/* State 4: List of Orders */}
        {!loading && !error && pedidos.length > 0 && (
          <div className="space-y-6">
            {pedidos.map(pedido => (
              <div 
                key={pedido.id} 
                className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs text-left"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center pb-4 border-b border-pastel-pink-100 gap-2">
                  <div>
                    <span className="text-xs text-pastel-pink-800 font-bold uppercase tracking-wider block">
                      Pedido #{pedido.id}
                    </span>
                    <span className="text-xs text-pastel-pink-900 font-medium">
                      📅 {formatDate(pedido.creado_en || pedido.fecha)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-pastel-pink-100 text-pastel-pink-900 border border-pastel-pink-200 uppercase tracking-wider">
                      {pedido.estado || "Pendiente"}
                    </span>
                    <span className="text-lg font-bold text-pastel-pink-950">
                      {formatCurrency(pedido.total)}
                    </span>
                  </div>
                </div>

                {/* Items List inside Order using producto_id as key */}
                <div className="mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider m-0">
                    Detalle del Pedido:
                  </h4>
                  <div className="divide-y divide-pastel-pink-100">
                    {pedido.items && pedido.items.map(item => (
                      <div 
                        key={item.producto_id || item.id} 
                        className="py-2.5 flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🍰</span>
                          <div>
                            <span className="font-bold text-pastel-pink-950">
                              {item.producto?.nombre || `Producto #${item.producto_id}`}
                            </span>
                            <span className="text-xs text-pastel-pink-900 ml-2 font-medium">
                              (x{item.cantidad})
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-pastel-pink-900">
                          {formatCurrency(item.precio_unitario * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
