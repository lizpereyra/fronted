import React, { useState, useEffect } from "react";
import { getProductos } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useCarrito } from "../context/CarritoContext";

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [notification, setNotification] = useState(null);

  const { agregar } = useCarrito();

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await getProductos({ page, limit: 6, nombre: busqueda });
      setProductos(data || []);
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [page, busqueda]);

  const handleAddToCart = (producto) => {
    if (producto.stock <= 0) {
      showNotification(`¡No hay stock disponible de ${producto.nombre}!`, "error");
      return;
    }
    agregar(producto, 1);
    showNotification(`Añadido ${producto.nombre} al carrito`, "success");
  };

  const showNotification = (msg, type = "info", duration = 3000) => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 flex flex-col font-sans text-pastel-pink-900">
      
      {/* Dynamic Notification Banner */}
      {notification && (
        <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-xl transition-all duration-300 text-sm max-w-md w-11/12 font-medium flex items-center gap-3 border ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
            : notification.type === "error" 
            ? "bg-rose-50 border-rose-300 text-rose-900" 
            : "bg-pink-50 border-pink-300 text-pink-900"
        }`}>
          <span>{notification.type === "success" ? "🌸" : notification.type === "error" ? "⚠️" : "✨"}</span>
          <p className="flex-1 m-0">{notification.msg}</p>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Main Catalog Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex-grow w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-pastel-pink-950 font-serif m-0">
              Catálogo Oficial de Dulce Vicio
            </h2>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Postres frescos elaborados artesanalmente.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pastel-pink-400">
                🔍
              </span>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={busqueda} 
                onChange={(e) => {
                  setPage(0);
                  setBusqueda(e.target.value);
                }}
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-pastel-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 text-sm text-pastel-pink-900 font-medium"
              />
            </div>
            
            <button 
              onClick={loadCatalog}
              className="px-3 py-2 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-900 border border-pastel-pink-300 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Actualizar Catálogo"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/60 rounded-3xl h-96 animate-pulse p-6 border border-pastel-pink-200">
                <div className="w-full h-40 bg-pastel-pink-100 rounded-2xl mb-4"></div>
                <div className="h-6 bg-pastel-pink-100 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-pastel-pink-100 rounded w-1/2 mb-8"></div>
                <div className="h-10 bg-pastel-pink-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          /* Empty Search Result Message */
          <div className="bg-white rounded-3xl border border-pastel-pink-200 text-pastel-pink-900 p-10 text-center max-w-lg mx-auto shadow-xs my-8">
            <span className="text-5xl mb-3 block select-none">🧁</span>
            <h3 className="font-bold text-xl text-pastel-pink-950 mb-2">No hay productos disponibles</h3>
            <p className="text-sm text-pastel-pink-800 m-0">
              {busqueda 
                ? `No encontramos ningún postre que coincida con "${busqueda}". Prueba ajustando tu búsqueda.` 
                : "En este momento no contamos con postres exhibidos."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map(prod => (
                <ProductCard 
                  key={prod.id} 
                  producto={prod} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 0}
                className="px-5 py-2 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-900 border border-pastel-pink-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-2xs cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs font-bold text-pastel-pink-950 bg-white border border-pastel-pink-300 px-4 py-2 rounded-xl shadow-2xs">
                Página {page + 1}
              </span>
              <button 
                onClick={() => setPage(page + 1)}
                disabled={productos.length < 6}
                className="px-5 py-2 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-900 border border-pastel-pink-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-2xs cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

    </div>
  );
}
