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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-pastel-pink-200 shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-all duration-200">
      
      {/* Product Banner / Emoji */}
      <div className={`h-40 bg-gradient-to-tr ${bgGradient} flex items-center justify-center relative overflow-hidden select-none`}>
        <div className="absolute w-20 h-20 bg-white/40 rounded-full -top-4 -left-4 blur-xs"></div>
        <div className="absolute w-24 h-24 bg-white/30 rounded-full -bottom-8 -right-8 blur-sm"></div>
        
        <span className="text-6xl drop-shadow-xs animate-float">
          {emoji}
        </span>
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow text-left">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="text-xl font-bold text-pastel-pink-950 font-serif leading-tight m-0">
            {producto.nombre}
          </h4>
          
          {/* Stock Badge */}
          {isOutOfStock ? (
            <span className="text-[11px] px-2.5 py-1 font-bold rounded-full bg-rose-100 text-rose-800 shrink-0">
              Agotado
            </span>
          ) : producto.stock <= 3 ? (
            <span className="text-[11px] px-2.5 py-1 font-bold rounded-full bg-amber-100 text-amber-900 shrink-0">
              ¡Solo {producto.stock}!
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-1 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              Stock: {producto.stock}
            </span>
          )}
        </div>

        {/* Price & Installments */}
        <div className="mt-auto pt-3 border-t border-pastel-pink-100">
          <p className="text-[11px] text-pastel-pink-800 font-semibold uppercase tracking-wider mb-0.5 m-0">
            Precio Final
          </p>
          <div className="text-2xl font-bold text-pastel-pink-900 mb-2">
            {formatCurrency(producto.precio_final)}
          </div>

          {producto.cuotas_cantidad > 1 && (
            <div className="bg-pastel-pink-50 rounded-xl p-2 border border-pastel-pink-200 text-xs text-pastel-pink-900 font-medium">
              💳 {producto.cuotas_cantidad} cuotas sin interés de {formatCurrency(producto.cuotas_valor)}
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Action */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onAddToCart(producto)}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-2xs transition-all duration-200 cursor-pointer ${
            isOutOfStock
              ? "bg-pastel-pink-100 text-pastel-pink-400 cursor-not-allowed border border-pastel-pink-200"
              : "bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white hover:shadow-xs active:scale-95"
          }`}
        >
          {isOutOfStock ? "Sin Stock Disponible" : "Agregar al Carrito"}
        </button>
      </div>

    </div>
  );
}
