import React, { useState, useEffect } from "react";
import { getProductos, comprarProductos } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Catalogo() {
  const [productosState, setProductosState] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRegretOpen, setIsRegretOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // Form states for Regret Button
  const [regretEmail, setRegretEmail] = useState("");
  const [regretPhone, setRegretPhone] = useState("");
  const [regretOrderCode, setRegretOrderCode] = useState("");
  const [regretReason, setRegretReason] = useState("");

  // Search & Pagination states
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  // Define wrapped state setter to manage loading/error automatically
  const setProductos = (data) => {
    setProductosState(data);
    setError("");
    setLoading(false);
  };

  const productos = productosState;

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await getProductos({ page, limit: 6, nombre: busqueda });
      setProductos(data);
      setError("");
    } catch (err) {
      setError("No pudimos conectar con la pastelería. Por favor, verifica que el servidor esté activo.");
      console.error(err);
      setLoading(false);
    }
  };

  // Load products when page or busqueda changes
  useEffect(() => {
    loadCatalog();
  }, [page, busqueda]);

  // Add to cart handler
  const handleAddToCart = (producto) => {
    const existingItem = cart.find(item => item.producto.id === producto.id);
    
    // Check stock limit in cart
    const currentQtyInCart = existingItem ? existingItem.cantidad : 0;
    if (currentQtyInCart >= producto.stock) {
      showNotification(`¡No hay más stock disponible de ${producto.nombre}!`, "error");
      return;
    }

    if (existingItem) {
      setCart(cart.map(item => 
        item.producto.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCart([...cart, { producto, cantidad: 1 }]);
    }
    showNotification(`Añadido ${producto.nombre} al carrito`, "success");
  };

  // Update quantity in cart
  const handleUpdateQuantity = (productoId, delta) => {
    const item = cart.find(item => item.producto.id === productoId);
    if (!item) return;

    const newQty = item.cantidad + delta;
    if (newQty <= 0) {
      setCart(cart.filter(item => item.producto.id !== productoId));
      showNotification(`Quitado ${item.producto.nombre} del carrito`, "info");
      return;
    }

    // Check stock
    if (delta > 0 && newQty > item.producto.stock) {
      showNotification(`No hay suficiente stock de ${item.producto.nombre}`, "error");
      return;
    }

    setCart(cart.map(item => 
      item.producto.id === productoId 
        ? { ...item, cantidad: newQty }
        : item
    ));
  };

  // Checkout submit handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Format items for the backend API
    const itemsPayload = cart.map(item => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad
    }));

    try {
      setLoading(true);
      await comprarProductos(itemsPayload);
      
      // Clean cart and reload catalog to reflect new stock
      setCart([]);
      setIsCartOpen(false);
      await loadCatalog();
      
      // Generate a mock purchase code for the regret button
      const orderCode = "DV-" + Math.floor(100000 + Math.random() * 900000);
      showNotification(`¡Compra exitosa! Código de pedido: ${orderCode}. Conserva este código si deseas ejercer tu derecho a revocación.`, "success", 10000);
    } catch (err) {
      showNotification(err.message || "Error al procesar la compra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Process regret/revocation request
  const handleRegretSubmit = (e) => {
    e.preventDefault();
    if (!regretEmail || !regretOrderCode) {
      showNotification("Por favor, completa los campos requeridos.", "error");
      return;
    }
    
    // Mock successful regret request (Ley 24.240)
    setIsRegretOpen(false);
    showNotification(`Solicitud de arrepentimiento enviada para el pedido ${regretOrderCode}. Nos contactaremos en un plazo máximo de 24 hs.`, "success", 8000);
    
    // Clear regret form
    setRegretEmail("");
    setRegretPhone("");
    setRegretOrderCode("");
    setRegretReason("");
  };

  // Notification helper
  const showNotification = (msg, type = "info", duration = 4000) => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Calculate cart totals
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.producto.precio_final * item.cantidad), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 flex flex-col font-sans selection:bg-pastel-pink-200 selection:text-pastel-pink-900">
      
      {/* Dynamic Notifications Banner */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 text-sm max-w-md w-11/12 font-medium flex items-start gap-3 border ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : notification.type === "error" 
            ? "bg-rose-50 border-rose-200 text-rose-800" 
            : "bg-pink-50 border-pink-200 text-pink-800"
        }`}>
          <span>{notification.type === "success" ? "🌸" : notification.type === "error" ? "⚠️" : "✨"}</span>
          <p className="flex-1">{notification.msg}</p>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-2">×</button>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-30 glassmorphism-dark border-b border-pastel-pink-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-pastel-pink-700 font-serif tracking-wide m-0">
              Dulce Vicio
            </h1>
            <p className="text-[10px] md:text-xs text-pastel-pink-500 uppercase tracking-widest font-semibold font-sans">
              Pastelería de Ensueño
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Legal quick info */}
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-pastel-pink-600 bg-white/50 px-3 py-1.5 rounded-full border border-pastel-pink-100 font-medium">
              🔒 Compra Protegida Ley 24.240
            </span>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-2xl bg-pastel-pink-500 text-white hover:bg-pastel-pink-600 transition-all duration-200 shadow-sm flex items-center gap-2 font-semibold cursor-pointer"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-400 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      <header className="relative py-20 px-6 overflow-hidden text-center bg-gradient-to-b from-pastel-pink-100 to-pastel-pink-50 border-b border-pastel-pink-100">
        {/* Background elements */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 text-9xl select-none opacity-20 pointer-events-none animate-bounce duration-10000">🧁</div>
        <div className="absolute top-1/3 right-12 text-9xl select-none opacity-20 pointer-events-none animate-bounce duration-8000">🍰</div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-pastel-pink-200/60 text-pastel-pink-700 text-xs font-semibold uppercase tracking-widest mb-4">
            Dulzuras Frescas Elaboradas con Amor
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-pastel-pink-850 font-serif mb-6 leading-tight">
            Sabores que enamoran en cada bocado
          </h2>
          <p className="text-base md:text-xl text-pastel-pink-750 max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            Bienvenidos a <strong className="font-serif text-pastel-pink-800">Dulce Vicio</strong>, donde cada porción es un viaje de felicidad. Haz tu pedido online hoy mismo y disfrútalo en casa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#catalogo" 
              className="px-8 py-3.5 rounded-2xl bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Explorar Catálogo
            </a>
            <button 
              onClick={() => setIsRegretOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-600 font-semibold border border-pastel-pink-200 shadow-sm transition-all duration-200 cursor-pointer"
            >
              Botón de Arrepentimiento
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalog Area */}
      <main id="catalogo" className="max-w-7xl mx-auto px-6 py-16 flex-grow w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-pastel-pink-850 font-serif">
              Nuestro Catálogo Dulce
            </h2>
            <p className="text-sm text-pastel-pink-600 mt-1">
              Selecciona tu postre favorito y realiza tu compra de forma segura.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pastel-pink-400">
                🔍
              </span>
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={busqueda} 
                onChange={(e) => {
                  setPage(0);
                  setBusqueda(e.target.value);
                  setLoading(true);
                }}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-pastel-pink-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pastel-pink-400 focus:border-transparent text-sm w-64 transition-all duration-200"
              />
            </div>
            
            <button 
              onClick={() => {
                setLoading(true);
                loadCatalog();
              }}
              className="p-2.5 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-650 border border-pastel-pink-200 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Recargar Catálogo"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Loading / Error or Product Grid */}
        {loading && productos.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glassmorphism rounded-3xl h-96 animate-pulse p-6 border border-pastel-pink-100">
                <div className="w-full h-40 bg-pastel-pink-100 rounded-2xl mb-4"></div>
                <div className="h-6 bg-pastel-pink-100 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-pastel-pink-100 rounded w-1/2 mb-8"></div>
                <div className="h-10 bg-pastel-pink-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
            <span className="text-4xl mb-3 block">🔌</span>
            <h3 className="font-bold text-lg mb-2">Error de Conexión</h3>
            <p className="text-sm mb-4">{error}</p>
            <button 
              onClick={loadCatalog}
              className="px-6 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-850 p-8 rounded-3xl text-center max-w-xl mx-auto animate-fade-in">
            <span className="text-4xl mb-3 block">🍰</span>
            <h3 className="font-bold text-lg mb-2">
              {busqueda ? "No se encontraron resultados" : "No hay productos cargados"}
            </h3>
            <p className="text-sm">
              {busqueda 
                ? `No encontramos postres que coincidan con "${busqueda}". Intenta con otra búsqueda.` 
                : "En este momento no contamos con stock en exhibición. Intenta actualizar en unos instantes."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map(prod => (
                <ProductCard 
                  key={prod.id} 
                  producto={prod} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <button 
                onClick={() => {
                  setPage(page - 1);
                  setLoading(true);
                }} 
                disabled={page === 0}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-650 border border-pastel-pink-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all text-sm font-semibold cursor-pointer shadow-sm active:scale-95"
              >
                Anterior
              </button>
              <span className="text-sm font-semibold text-pastel-pink-850 bg-white border border-pastel-pink-200 px-4 py-2.5 rounded-xl shadow-xs">
                Página {page + 1}
              </span>
              <button 
                onClick={() => {
                  setPage(page + 1);
                  setLoading(true);
                }}
                disabled={productos.length < 6}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-pastel-pink-100 text-pastel-pink-650 border border-pastel-pink-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all text-sm font-semibold cursor-pointer shadow-sm active:scale-95"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      {/* Slide-over Shopping Cart Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Cart Slide Sheet */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl border-l border-pastel-pink-200">
                  
                  {/* Cart Header */}
                  <div className="px-6 py-6 bg-pastel-pink-50 border-b border-pastel-pink-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-pastel-pink-850 font-serif">Tu Carrito Dulce</h2>
                      <p className="text-xs text-pastel-pink-500">{cartCount} {cartCount === 1 ? "unidad" : "unidades"} seleccionadas</p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)} 
                      className="p-2 rounded-xl text-gray-500 hover:text-pastel-pink-600 hover:bg-pastel-pink-100 transition-all font-bold cursor-pointer"
                    >
                      ❌ Cerrar
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-pastel-pink-100">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                        <span className="text-5xl mb-3">🛒</span>
                        <p className="text-sm font-semibold">El carrito está vacío</p>
                        <p className="text-xs max-w-xs mt-1">Explora nuestro catálogo y agrega las delicias que más te gusten.</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.producto.id} className="py-4 flex gap-4">
                          <div className="w-16 h-16 bg-pastel-pink-150 rounded-2xl flex items-center justify-center text-3xl select-none">
                            {item.producto.nombre === "Tiramisú" ? "☕" : 
                             item.producto.nombre === "Brownie" ? "🍫" : 
                             item.producto.nombre === "Chocotorta" ? "🍰" : 
                             item.producto.nombre === "Turrón de Quaker" ? "🌾" : 
                             item.producto.nombre === "Budín de pan" ? "🍮" : 
                             item.producto.nombre === "Flan" ? "🍮" : "🍪"}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-pastel-pink-900">{item.producto.nombre}</h4>
                              <p className="text-xs text-pastel-pink-650 font-semibold">{formatCurrency(item.producto.precio_final)} c/u</p>
                            </div>
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-2 mt-2">
                              <button 
                                onClick={() => handleUpdateQuantity(item.producto.id, -1)}
                                className="w-7 h-7 rounded-lg border border-pastel-pink-200 bg-pastel-pink-50/50 flex items-center justify-center font-bold text-pastel-pink-700 hover:bg-pastel-pink-100 active:scale-90 transition-all cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.producto.id, 1)}
                                className="w-7 h-7 rounded-lg border border-pastel-pink-200 bg-pastel-pink-50/50 flex items-center justify-center font-bold text-pastel-pink-700 hover:bg-pastel-pink-100 active:scale-90 transition-all cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right flex flex-col justify-between items-end">
                            <span className="text-sm font-bold text-pastel-pink-800">
                              {formatCurrency(item.producto.precio_final * item.cantidad)}
                            </span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.producto.id, -item.cantidad)}
                              className="text-xs text-red-500 hover:text-red-700 underline font-semibold transition-all cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="px-6 py-6 bg-pastel-pink-50/60 border-t border-pastel-pink-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-pastel-pink-850">Subtotal Neto</span>
                        <span className="text-xl font-bold text-pastel-pink-750">{formatCurrency(cartSubtotal)}</span>
                      </div>
                      
                      {/* Legal warning/terms on final price (Ley 24.240 compliance) */}
                      <div className="bg-white/80 border border-pastel-pink-200 rounded-xl p-3 mb-5 text-[11px] text-pastel-pink-800">
                        <p className="font-semibold text-pink-700">🔒 Información Fiscal & Facturación</p>
                        <p className="mt-0.5">El precio exhibido corresponde al precio final que abonará el consumidor (IVA e impuestos incluidos - Art 4 Ley 24.240).</p>
                        <p className="mt-1 font-semibold text-emerald-800">🚚 Coordinación de entrega:</p>
                        <p className="mt-0.5">Te enviaremos un correo inmediatamente luego de confirmar el pago para programar el envío o retiro.</p>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                          loading 
                            ? "bg-pastel-pink-400 cursor-not-allowed" 
                            : "bg-pastel-pink-500 hover:bg-pastel-pink-600 active:scale-95"
                        }`}
                      >
                        {loading ? "Procesando Compra..." : `Confirmar Compra por ${formatCurrency(cartSubtotal)}`}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Arrepentimiento Modal (Ley 24.240) */}
      {isRegretOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsRegretOpen(false)}></div>
          
          <div className="glassmorphism rounded-3xl border border-pastel-pink-250 p-6 md:p-8 max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl md:text-2xl font-bold text-pastel-pink-900 font-serif mb-3">
              Botón de Arrepentimiento
            </h3>
            
            <div className="bg-pink-50 border border-pink-200 text-pastel-pink-900 rounded-2xl p-4 text-xs mb-5 leading-relaxed">
              <p className="font-bold text-pastel-pink-800 mb-1">📢 Ley N° 24.240 - Defensa del Consumidor</p>
              <p>Conforme al **Artículo 34 de la Ley 24.240** y la **Resolución 424/2020 de la Secretaría de Comercio Interior**, tienes derecho a revocar la aceptación de tu compra dentro del plazo de 10 (diez) días corridos contados a partir de la fecha de realización de la compra o de la entrega del producto (lo que ocurra último) sin responsabilidad alguna.</p>
              <p className="mt-2 font-bold text-pastel-pink-800">⚠️ Nota para productos alimenticios:</p>
              <p>Por motivos de higiene y seguridad alimentaria, las devoluciones solo son válidas si el producto no fue abierto de su embalaje original o si se constata una falla en la elaboración al momento de recibirlo.</p>
            </div>

            <form onSubmit={handleRegretSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-pastel-pink-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico *
                </label>
                <input 
                  type="email" 
                  required
                  value={regretEmail} 
                  onChange={(e) => setRegretEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pastel-pink-400 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-pastel-pink-700 uppercase tracking-wider mb-1.5">
                    Teléfono / Celular
                  </label>
                  <input 
                    type="tel" 
                    value={regretPhone} 
                    onChange={(e) => setRegretPhone(e.target.value)}
                    placeholder="11 2345 6789"
                    className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pastel-pink-400 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pastel-pink-700 uppercase tracking-wider mb-1.5">
                    Código de Pedido *
                  </label>
                  <input 
                    type="text" 
                    required
                    value={regretOrderCode} 
                    onChange={(e) => setRegretOrderCode(e.target.value)}
                    placeholder="ej: DV-123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pastel-pink-400 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pastel-pink-700 uppercase tracking-wider mb-1.5">
                  Motivo de la revocación (Opcional)
                </label>
                <textarea 
                  rows="3"
                  value={regretReason} 
                  onChange={(e) => setRegretReason(e.target.value)}
                  placeholder="Comenta aquí si el pedido no era el correcto o tuviste algún inconveniente..."
                  className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-pastel-pink-400 focus:border-transparent text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsRegretOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-pastel-pink-200 text-gray-700 font-semibold hover:bg-gray-100 transition-all text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-4 rounded-xl bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white font-semibold transition-all shadow-sm text-sm cursor-pointer"
                >
                  Confirmar Revocación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Términos y Condiciones Ley 24.240 Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsTermsOpen(false)}></div>
          
          <div className="glassmorphism rounded-3xl border border-pastel-pink-250 p-6 md:p-8 max-w-2xl w-full relative z-10 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-pastel-pink-900 font-serif">
                Términos y Condiciones (Ley N° 24.240)
              </h3>
              <button onClick={() => setIsTermsOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            
            <div className="space-y-4 text-left text-sm text-gray-700 leading-relaxed pr-2">
              <p>En cumplimiento con las normativas locales vigentes de la República Argentina y en especial la <strong>Ley de Defensa del Consumidor N° 24.240</strong>, Dulce Vicio expone sus bases contractuales:</p>
              
              <h4 className="font-bold text-pastel-pink-800 border-b border-pastel-pink-100 pb-1 mt-3">1. Deber de Información</h4>
              <p>Dulce Vicio expone los precios de manera clara y comprensiva, incluyendo en ellos el impuesto al valor agregado (IVA). Los montos expresados en cuotas representan la opción de financiación con tarjeta de crédito mediante acuerdo bancario con el cliente, aplicando un Costo Financiero Total (C.F.T.) de 0,00% salvo especificación contraria explícita.</p>
              
              <h4 className="font-bold text-pastel-pink-800 border-b border-pastel-pink-100 pb-1 mt-3">2. Calidad de Productos Alimenticios</h4>
              <p>Nuestros productos corresponden a repostería fresca, elaborada diariamente. Las materias primas poseen las correspondientes autorizaciones bromatológicas. Una vez entregado el producto, se aconseja conservar en frío (heladera entre 2°C y 8°C) para mantener su inocuidad y calidad.</p>
              
              <h4 className="font-bold text-pastel-pink-800 border-b border-pastel-pink-100 pb-1 mt-3">3. Revocación (Derecho de Arrepentimiento)</h4>
              <p>De acuerdo al artículo 34 de la ley 24.240, el consumidor cuenta con 10 días para deshacer la compra. En alimentos, por la naturaleza perecedera de los mismos, se exceptúa de esta regla a aquellos dulces que hayan sido abiertos, manipulados o que hayan perdido la cadena de frío, con el fin de proteger la salud pública.</p>

              <h4 className="font-bold text-pastel-pink-800 border-b border-pastel-pink-100 pb-1 mt-3">4. Reclamos</h4>
              <p>Ante cualquier disconformidad con la entrega o el estado del producto al recibirlo, puedes canalizar tu reclamo por correo o por nuestras líneas de atención telefónica dentro de las 12 horas de haberlo recibido, agilizando una reposición inmediata o reintegro.</p>
            </div>
            
            <button 
              onClick={() => setIsTermsOpen(false)}
              className="mt-6 w-full py-3 rounded-xl bg-pastel-pink-500 hover:bg-pastel-pink-600 text-white font-semibold transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Footer (Legal Section complying with Ley 24.240) */}
      <footer className="bg-white border-t border-pastel-pink-200 py-12 px-6 mt-12 text-center text-xs md:text-sm text-pastel-pink-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          
          {/* Brand Info */}
          <div>
            <h4 className="text-base font-bold text-pastel-pink-900 font-serif mb-3">Dulce Vicio Pastelería</h4>
            <p className="text-gray-500 leading-relaxed mb-3">
              Elaborando momentos felices con dulces artesanales y la mayor calidad. Local habilitado en la Ciudad Autónoma de Buenos Aires.
            </p>
            <p className="text-[11px] text-pastel-pink-500">
              © {new Date().getFullYear()} Dulce Vicio. Todos los derechos reservados.
            </p>
          </div>

          {/* Useful Links & Law Compliance */}
          <div>
            <h4 className="text-base font-bold text-pastel-pink-900 font-serif mb-3">Defensa del Consumidor</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.argentina.gob.ar/produccion/defensadelconsumidor" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pastel-pink-600 hover:text-pastel-pink-850 hover:underline flex items-center gap-1.5"
                >
                  🔗 Portal Oficial de Defensa del Consumidor
                </a>
              </li>
              <li>
                <button 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-pastel-pink-600 hover:text-pastel-pink-850 hover:underline flex items-center gap-1.5 text-left bg-transparent border-none p-0 cursor-pointer"
                >
                  📄 Términos, Condiciones y Revocaciones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsRegretOpen(true)}
                  className="text-pastel-pink-600 hover:text-pastel-pink-850 hover:underline flex items-center gap-1.5 text-left bg-transparent border-none p-0 cursor-pointer"
                >
                  ↩️ Ejercer Botón de Arrepentimiento (Ley 24.240)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal warning/footer */}
          <div>
            <h4 className="text-base font-bold text-pastel-pink-900 font-serif mb-3">Derechos del Consumidor</h4>
            <p className="text-gray-500 leading-relaxed text-xs">
              Conforme a la Ley N° 24.240, tienes derecho a recibir información cierta, clara y detallada acerca de los productos que adquieres. Los contratos de consumo están amparados por las leyes nacionales vigentes. Ante cualquier duda, puedes acudir al organismo de control correspondiente.
            </p>
          </div>

        </div>

        {/* Defensa del Consumidor official banner simulation */}
        <div className="pt-6 border-t border-pastel-pink-100 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500">
          <p>
            Ley 24.240 de Defensa del Consumidor. Servicio de atención al cliente: <span className="font-bold text-pastel-pink-800">hola@dulcevicio.com.ar</span>
          </p>
          <a 
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-all font-semibold"
          >
            Gobierno de la Nación Argentina - Defensa del Consumidor
          </a>
        </div>
      </footer>

    </div>
  );
}
