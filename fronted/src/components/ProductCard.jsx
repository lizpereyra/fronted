import React from "react";

const EMOJIS = {
  "Tiramisú": "☕🍰",
  "Brownie": "🍫🧁",
  "Chocotorta": "🍫🍰",
  "Turrón de Quaker": "🌾🍫",
  "Budín de pan": "🍮🍞",
  "Flan": "🍮✨",
  "Cookie": "🍪💖"
};

const BACKGROUNDS = {
  "Tiramisú": "from-amber-100 to-rose-100",
  "Brownie": "from-amber-200 to-rose-200",
  "Chocotorta": "from-orange-100 to-rose-200",
  "Turrón de Quaker": "from-yellow-100 to-rose-100",
  "Budín de pan": "from-orange-50 to-amber-100",
  "Flan": "from-yellow-50 to-amber-200",
  "Cookie": "from-rose-100 to-pink-200"
};

export default function ProductCard({ producto, onAddToCart }) {
  const emoji = EMOJIS[producto.nombre] || "🍰";
  const bgGradient = BACKGROUNDS[producto.nombre] || "from-pink-100 to-rose-100";
  const isOutOfStock = producto.stock <= 0;

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="glassmorphism rounded-3xl overflow-hidden hover-scale border border-pastel-pink-200 shadow-sm flex flex-col justify-between h-full">
      {/* Product Image Area / Emoji Header */}
      <div className={`h-40 bg-gradient-to-tr ${bgGradient} flex items-center justify-center relative overflow-hidden`}>
        {/* Decorative background circles */}
        <div className="absolute w-24 h-24 bg-white/30 rounded-full -top-6 -left-6 blur-md"></div>
        <div className="absolute w-28 h-28 bg-white/20 rounded-full -bottom-10 -right-10 blur-lg"></div>
        
        {/* Floating Emoji */}
        <span className="text-6xl select-none animate-float drop-shadow-md">
          {emoji}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-6 flex flex-col flex-grow text-left">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-pastel-pink-900 font-serif leading-tight">
            {producto.nombre}
          </h3>
          
          {/* Stock Badge */}
          {isOutOfStock ? (
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-red-100 text-red-700">
              Agotado
            </span>
          ) : producto.stock <= 3 ? (
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-amber-100 text-amber-800 animate-pulse">
              ¡Solo {producto.stock}!
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-emerald-50 text-emerald-700">
              En Stock: {producto.stock}
            </span>
          )}
        </div>

        {/* Legal and Price Details - Ley 24.240 */}
        <div className="mt-auto pt-4 border-t border-pastel-pink-100/60">
          <p className="text-xs text-pastel-pink-600/70 font-medium uppercase tracking-wider mb-1">
            Precio Final
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-pastel-pink-700">
              {formatCurrency(producto.precio_final)}
            </span>
          </div>

          {/* Installments (Ley 24.240 requirement of clear financing terms) */}
          {producto.cuotas_cantidad > 1 && (
            <div className="bg-pastel-pink-50/50 rounded-xl p-2.5 border border-pastel-pink-100 text-xs text-pastel-pink-800">
              <p className="font-semibold text-pink-700">
                💳 {producto.cuotas_cantidad} cuotas sin interés de {formatCurrency(producto.cuotas_valor)}
              </p>
              <p className="text-[10px] text-pastel-pink-600/80 mt-0.5">
                C.F.T.: 0,00% - T.N.A.: 0,00% (Ley 24.240)
              </p>
            </div>
          )}

          {/* Food guarantee or health info (Legal transparency) */}
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Elaboración fresca del día</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onAddToCart(producto)}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-2xl font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
            isOutOfStock
              ? "bg-pastel-pink-100 text-pastel-pink-400 cursor-not-allowed"
              : "bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white hover:shadow-md active:scale-95"
          }`}
        >
          {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
        </button>
      </div>
    </div>
  );
}
