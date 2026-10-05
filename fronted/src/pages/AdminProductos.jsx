import React, { useState, useEffect, useRef } from "react";
import { getProductos, actualizarProducto, subirImagen, crearProducto, getTodosLosPedidos, registrarCompraAdmin } from "../services/api";
import { urlImagen } from "../utils/imagenes";

export default function AdminProductos() {
  const [tabActiva, setTabActiva] = useState("productos"); // "productos" | "pedidos"

  // Estado de Productos
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [esNuevoProducto, setEsNuevoProducto] = useState(false);

  // Campos del Formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("");

  // Campos de Registro de Compra desde Admin
  const [compraProdId, setCompraProdId] = useState("");
  const [compraCantidad, setCompraCantidad] = useState(1);
  const [compraClienteNombre, setCompraClienteNombre] = useState("");
  const [compraClienteEmail, setCompraClienteEmail] = useState("");
  const [procesandoCompraAdmin, setProcesandoCompraAdmin] = useState(false);

  // Manejo de Input de Archivo (NO controlado) y Vista Previa Local
  const fileInputRef = useRef(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [errorImagen, setErrorImagen] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState(null);

  // Estado de Pedidos de Clientes
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Cargar lista de productos al montar
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductos({ limit: 100 });
      setProductos(data || []);
      if (data && data.length > 0 && !productoSeleccionado && !esNuevoProducto) {
        seleccionarProducto(data[0]);
      }
    } catch (err) {
      console.error("Error al cargar productos para administración:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de todos los pedidos de clientes (Admin)
  const cargarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const data = await getTodosLosPedidos();
      setPedidos(data || []);
    } catch (err) {
      console.error("Error al cargar pedidos de clientes:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (tabActiva === "pedidos") {
      cargarPedidos();
    }
  }, [tabActiva]);

  // Limpieza de ObjectURL de la vista previa para liberar memoria
  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const seleccionarProducto = (p) => {
    setEsNuevoProducto(false);
    setProductoSeleccionado(p);
    setNombre(p.nombre || "");
    setPrecio(p.precio_final ?? p.precio ?? 0);
    setDescripcion(p.descripcion || "");
    setCategoria(p.categoria || "Postres");
    setStock(p.stock ?? 0);
    limpiarFormularioImagen();
    setMensajeStatus(null);
  };

  const prepararNuevoProducto = () => {
    setEsNuevoProducto(true);
    setProductoSeleccionado(null);
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setCategoria("Postres");
    setStock(10);
    limpiarFormularioImagen();
    setMensajeStatus(null);
  };

  const limpiarFormularioImagen = () => {
    setArchivoSeleccionado(null);
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }
    setVistaPrevia(null);
    setErrorImagen("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Manejador del Input File con Validaciones en Cliente (Cortesía)
  const handleFileChange = (e) => {
    setErrorImagen("");
    const file = e.target.files && e.target.files[0];
    if (!file) {
      limpiarFormularioImagen();
      return;
    }

    // Validar tipo JPG/PNG/WEBP
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!tiposPermitidos.includes(file.type.toLowerCase())) {
      setErrorImagen("El archivo no es una imagen permitida (Solo JPG, PNG o WEBP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setArchivoSeleccionado(null);
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
      setVistaPrevia(null);
      return;
    }

    // Validar tamaño menor a 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setErrorImagen("La imagen no puede pasar de 2 MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setArchivoSeleccionado(null);
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
      setVistaPrevia(null);
      return;
    }

    // Generar vista previa local
    setArchivoSeleccionado(file);
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }
    const previewUrl = URL.createObjectURL(file);
    setVistaPrevia(previewUrl);
  };

  // Crear o Actualizar Producto
  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    if (!esNuevoProducto && !productoSeleccionado) return;

    setGuardando(true);
    setMensajeStatus(null);

    const payload = {
      nombre,
      precio_final: parseFloat(precio) || 0,
      descripcion,
      categoria,
      stock: parseInt(stock, 10) || 0
    };

    try {
      if (esNuevoProducto) {
        const nuevo = await crearProducto(payload);
        setMensajeStatus({ type: "success", text: "✨ ¡Nuevo producto creado con éxito!" });
        setEsNuevoProducto(false);
        await cargarProductos();
        if (nuevo && nuevo.id) {
          seleccionarProducto(nuevo);
        }
      } else {
        const actualizado = await actualizarProducto(productoSeleccionado.id, payload);
        setProductoSeleccionado(actualizado);
        setMensajeStatus({ type: "success", text: "✅ Producto actualizado con éxito." });
        await cargarProductos();
      }
    } catch (err) {
      setMensajeStatus({ type: "error", text: `❌ Error en la operación: ${err.message}` });
    } finally {
      setGuardando(false);
    }
  };

  // Subida de Imagen usando subirImagen(id, archivo)
  const handleSubirImagen = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !archivoSeleccionado) return;

    setSubiendo(true);
    setErrorImagen("");
    setMensajeStatus(null);

    try {
      const respuesta = await subirImagen(productoSeleccionado.id, archivoSeleccionado);
      setMensajeStatus({ type: "success", text: "🖼️ Imagen subida correctamente." });
      
      if (respuesta && respuesta.imagen_url) {
        setProductoSeleccionado(prev => ({ ...prev, imagen_url: respuesta.imagen_url }));
      }
      
      // Limpiar ref del input y vista previa al finalizar
      limpiarFormularioImagen();
      await cargarProductos();
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setErrorImagen(err.message || "Error al subir la imagen");
    } finally {
      setSubiendo(false);
    }
  };

  // Handler para registrar compras desde Admin
  const handleRegistrarCompraAdmin = async (e) => {
    e.preventDefault();
    const prodTarget = productos.find(p => String(p.id) === String(compraProdId)) || productoSeleccionado;
    if (!prodTarget) {
      setMensajeStatus({ type: "error", text: "Selecciona un producto para registrar la compra." });
      return;
    }
    const qty = parseInt(compraCantidad, 10);
    if (!qty || qty < 1) {
      setMensajeStatus({ type: "error", text: "La cantidad ingresada debe ser mayor a 0." });
      return;
    }
    if (qty > prodTarget.stock) {
      setMensajeStatus({ type: "error", text: `Stock insuficiente para ${prodTarget.nombre} (disponible: ${prodTarget.stock})` });
      return;
    }

    setProcesandoCompraAdmin(true);
    setMensajeStatus(null);
    try {
      await registrarCompraAdmin(prodTarget, qty, {
        nombre: compraClienteNombre || "Venta Directa Admin",
        email: compraClienteEmail || "admin@dulcevicio.com"
      });
      setMensajeStatus({
        type: "success",
        text: `✨ Compra del producto '${prodTarget.nombre}' x${qty} registrada correctamente. Figurando en Compras.`
      });
      setCompraCantidad(1);
      setCompraClienteNombre("");
      setCompraClienteEmail("");
      await cargarProductos();
      await cargarPedidos();
    } catch (err) {
      setMensajeStatus({ type: "error", text: `Error al registrar la compra: ${err.message}` });
    } finally {
      setProcesandoCompraAdmin(false);
    }
  };

  const currentImgUrl = urlImagen(productoSeleccionado);

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-10 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado Principal & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
              🛠️ Panel de Administración
            </h1>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Gestiona productos del catálogo y visualiza los pedidos realizados por los clientes.
            </p>
          </div>

          {/* Botones de Navegación por Pestañas */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-pastel-pink-200 shadow-2xs self-start md:self-auto">
            <button
              onClick={() => setTabActiva("productos")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                tabActiva === "productos"
                  ? "bg-pastel-pink-600 text-white shadow-xs"
                  : "text-pastel-pink-950 hover:bg-pastel-pink-100"
              }`}
            >
              🍰 Productos ({productos.length})
            </button>

            <button
              onClick={() => setTabActiva("pedidos")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                tabActiva === "pedidos"
                  ? "bg-pastel-pink-600 text-white shadow-xs"
                  : "text-pastel-pink-950 hover:bg-pastel-pink-100"
              }`}
            >
              📦 Pedidos de Clientes ({pedidos.length})
            </button>
          </div>
        </div>

        {/* Notificación de Estado Global */}
        {mensajeStatus && (
          <div
            role="status"
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-xs ${
              mensajeStatus.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}
          >
            <span>{mensajeStatus.text}</span>
            <button onClick={() => setMensajeStatus(null)} className="font-bold text-gray-500 hover:text-gray-800 ml-4">
              ×
            </button>
          </div>
        )}

        {/* PESTAÑA 1: GESTIÓN DE PRODUCTOS */}
        {tabActiva === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Columna 1: Lista de Productos */}
            <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs space-y-4">
              <div className="border-b border-pastel-pink-100 pb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-pastel-pink-950 font-serif m-0">
                  🍰 Catálogo
                </h3>
                
                {/* Botón para Crear Nuevo Producto */}
                <button
                  onClick={prepararNuevoProducto}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>➕</span>
                  <span>Nuevo Producto</span>
                </button>
              </div>

              {loading ? (
                <div className="py-10 text-center">
                  <div className="inline-block animate-spin text-3xl mb-2">🌸</div>
                  <p className="text-xs font-semibold text-pastel-pink-800 m-0">Cargando catálogo…</p>
                </div>
              ) : productos.length === 0 ? (
                <p className="text-xs text-pastel-pink-800 m-0 py-4 text-center">No hay productos cargados.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {productos.map((prod) => {
                    const isSelected = !esNuevoProducto && productoSeleccionado?.id === prod.id;
                    const img = urlImagen(prod);
                    return (
                      <button
                        key={prod.id}
                        onClick={() => seleccionarProducto(prod)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-pastel-pink-600 text-white border-pastel-pink-700 shadow-xs"
                            : "bg-white hover:bg-pastel-pink-50 text-pastel-pink-950 border-pastel-pink-200"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-pastel-pink-100 shrink-0 overflow-hidden flex items-center justify-center border border-pastel-pink-200">
                          {img ? (
                            <img src={img} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🧁</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold truncate m-0 ${isSelected ? "text-white" : "text-pastel-pink-950"}`}>
                            {prod.nombre}
                          </h4>
                          <div className="flex justify-between items-center text-xs mt-0.5">
                            <span className={isSelected ? "text-pastel-pink-100" : "text-pastel-pink-800 font-semibold"}>
                              ${prod.precio_final ?? prod.precio}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isSelected ? "bg-white/20 text-white" : "bg-pastel-pink-100 text-pastel-pink-900"
                            }`}>
                              Stock: {prod.stock}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Columna 2 & 3: Formulario de Edición / Creación y Subida de Imagen */}
            {esNuevoProducto || productoSeleccionado ? (
              <div className="lg:col-span-2 space-y-6">
                
                {/* Bloque 1: Edición / Creación de Datos Principales */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-pastel-pink-200 shadow-xs space-y-6">
                  <div className="border-b border-pastel-pink-100 pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                        {esNuevoProducto ? "Formulario de Alta" : `Editando Producto #${productoSeleccionado.id}`}
                      </span>
                      <h2 className="text-2xl font-bold text-pastel-pink-950 font-serif m-0">
                        {esNuevoProducto ? "✨ Crear Nuevo Producto" : productoSeleccionado.nombre}
                      </h2>
                    </div>

                    {esNuevoProducto && (
                      <button
                        type="button"
                        onClick={() => {
                          if (productos.length > 0) seleccionarProducto(productos[0]);
                          else setEsNuevoProducto(false);
                        }}
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer"
                      >
                        Cancelar Alta
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleGuardarDatos} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Nombre */}
                      <div>
                        <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                          Nombre del Producto:
                        </label>
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Ej. Tarta de Frutillas"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                        />
                      </div>

                      {/* Precio */}
                      <div>
                        <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                          Precio ($ ARS):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                          placeholder="Ej. 4500"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                        />
                      </div>

                      {/* Categoría */}
                      <div>
                        <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                          Categoría:
                        </label>
                        <input
                          type="text"
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          placeholder="Postres, Tortas, Galletas..."
                          className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                          Stock Disponible:
                        </label>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          required
                          min="0"
                          className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                        />
                      </div>

                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                        Descripción:
                      </label>
                      <textarea
                        rows="3"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción detallada del producto..."
                        className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={guardando}
                        className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                          esNuevoProducto
                            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
                            : "bg-pastel-pink-600 hover:bg-pastel-pink-700 active:bg-pastel-pink-800"
                        }`}
                      >
                        {guardando
                          ? "Procesando…"
                          : esNuevoProducto
                          ? "✨ Crear Nuevo Producto"
                          : "💾 Guardar Cambios del Producto"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Bloque 2: Subida y Gestión de Imagen (Solo si hay producto seleccionado existente) */}
                {!esNuevoProducto && productoSeleccionado && (
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-pastel-pink-200 shadow-xs space-y-6">
                    <h3 className="text-xl font-bold text-pastel-pink-950 font-serif m-0 border-b border-pastel-pink-100 pb-3 flex items-center gap-2">
                      <span>📸</span>
                      <span>Gestión de Imagen de Catálogo</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      
                      {/* Vista Previa Actual o Local */}
                      <div className="flex flex-col items-center justify-center p-4 bg-pastel-pink-50 rounded-2xl border border-pastel-pink-200 min-h-[220px]">
                        <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider mb-2">
                          {vistaPrevia ? "Vista Previa de la Nueva Imagen:" : "Imagen Actual en Catálogo:"}
                        </span>
                        
                        <div className="w-40 h-40 rounded-2xl overflow-hidden aspect-square border-2 border-pastel-pink-300 bg-white shadow-xs flex items-center justify-center relative">
                          {vistaPrevia ? (
                            <img
                              src={vistaPrevia}
                              alt="Vista previa seleccionada"
                              className="w-full h-full object-cover"
                            />
                          ) : currentImgUrl ? (
                            <img
                              src={currentImgUrl}
                              alt={productoSeleccionado.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-pastel-pink-400 select-none">
                              <span className="text-4xl mb-1">🍰</span>
                              <span className="text-xs font-semibold">Sin imagen</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Formulario de Subida (Input NO controlado) */}
                      <form onSubmit={handleSubirImagen} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-pastel-pink-950 uppercase tracking-wider mb-2">
                            Seleccionar Archivo (JPG, PNG, WEBP &lt; 2 MB):
                          </label>
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-pastel-pink-900 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pastel-pink-600 file:text-white hover:file:bg-pastel-pink-700 file:cursor-pointer cursor-pointer border border-pastel-pink-300 rounded-xl bg-white p-1"
                          />
                        </div>

                        {errorImagen && (
                          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-xs font-semibold">
                            ⚠️ {errorImagen}
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={!archivoSeleccionado || subiendo}
                            className="px-6 py-2.5 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 active:bg-pastel-pink-800 text-white font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {subiendo ? "Subiendo…" : "Subir Imagen de Producto"}
                          </button>

                          {archivoSeleccionado && !subiendo && (
                            <button
                              type="button"
                              onClick={limpiarFormularioImagen}
                              className="px-3 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </form>

                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-pastel-pink-200 text-center shadow-xs flex flex-col items-center justify-center">
                <span className="text-5xl mb-3">👈</span>
                <p className="text-base font-bold text-pastel-pink-950 m-0">Selecciona un producto de la lista o crea uno nuevo.</p>
              </div>
            )}

          </div>
        )}

        {/* PESTAÑA 2: PEDIDOS Y REGISTRO DE COMPRAS */}
        {tabActiva === "pedidos" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-pastel-pink-200 shadow-xs space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-pastel-pink-100 pb-4 gap-4">
              <div>
                <h3 className="text-xl font-bold text-pastel-pink-950 font-serif m-0">
                  📦 Historial Global de Pedidos y Registro de Compras
                </h3>
                <p className="text-xs text-pastel-pink-800 mt-1 m-0">
                  Listado en tiempo real de compras y solicitudes recibidas.
                </p>
              </div>

              <button
                onClick={cargarPedidos}
                className="px-4 py-2 rounded-xl bg-pastel-pink-100 hover:bg-pastel-pink-200 text-pastel-pink-950 border border-pastel-pink-300 font-bold text-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                🔄 Actualizar Pedidos
              </button>
            </div>

            {/* Formulario de Alta / Registro de Compra desde Admin */}
            <div className="bg-pastel-pink-50 p-5 rounded-2xl border border-pastel-pink-200 space-y-4">
              <h4 className="text-sm font-bold text-pastel-pink-950 font-serif m-0 flex items-center gap-2">
                <span>🛒</span>
                <span>Registrar Compra / Venta Directa (Admin)</span>
              </h4>
              <form onSubmit={handleRegistrarCompraAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                    Producto:
                  </label>
                  <select
                    value={compraProdId}
                    onChange={(e) => setCompraProdId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                  >
                    <option value="">-- Seleccionar Producto --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.nombre} - ${p.precio_final ?? p.precio} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={compraCantidad}
                    onChange={(e) => setCompraCantidad(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
                    Cliente (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez / Presencial"
                    value={compraClienteNombre}
                    onChange={(e) => setCompraClienteNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pastel-pink-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={procesandoCompraAdmin || !compraProdId}
                    className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {procesandoCompraAdmin ? "Registrando…" : "⚡ Confirmar y Registrar Compra"}
                  </button>
                </div>
              </form>
            </div>

            {loadingPedidos ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin text-3xl mb-2">📦</div>
                <p className="text-xs font-semibold text-pastel-pink-800 m-0">Cargando pedidos de los clientes…</p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="py-12 text-center bg-pastel-pink-50 rounded-2xl border border-pastel-pink-200">
                <span className="text-4xl mb-2 block">📭</span>
                <p className="text-sm font-bold text-pastel-pink-950 m-0">No se han registrado pedidos en el sistema aún.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((ped) => {
                  const fechaFormateada = ped.creado_en
                    ? new Date(ped.creado_en).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Fecha no registrada";

                  const estadoStyle =
                    (ped.estado || "").toLowerCase() === "revocado"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : (ped.estado || "").toLowerCase() === "completado"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-300";

                  return (
                    <div
                      key={ped.id}
                      className="p-5 rounded-2xl border border-pastel-pink-200 bg-white hover:border-pastel-pink-300 transition-all shadow-2xs space-y-4"
                    >
                      {/* Cabecera del Pedido */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pastel-pink-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-pastel-pink-950 font-serif">
                            Pedido #{ped.id}
                          </span>
                          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${estadoStyle}`}>
                            {(ped.estado || "pendiente").toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs text-pastel-pink-800 font-medium">
                          📅 {fechaFormateada}
                        </div>
                      </div>

                      {/* Info del Cliente */}
                      <div className="bg-pastel-pink-50 p-3 rounded-xl border border-pastel-pink-100 text-xs flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-pastel-pink-950">Cliente: </span>
                          <span className="font-semibold text-pastel-pink-900">
                            {ped.usuario?.nombre || `Usuario #${ped.usuario_id || "Anonimizado"}`}
                          </span>
                        </div>
                        {ped.usuario?.email && (
                          <div>
                            <span className="font-bold text-pastel-pink-950">Email: </span>
                            <span className="font-semibold text-pastel-pink-800">{ped.usuario.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Items del Pedido */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-pastel-pink-900 uppercase tracking-wider block">
                          Ítems solicitados:
                        </span>
                        <div className="divide-y divide-pastel-pink-100">
                          {ped.items && ped.items.map((item) => (
                            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-pastel-pink-950">
                                  {item.producto?.nombre || `Producto #${item.producto_id}`}
                                </span>
                                <span className="text-pastel-pink-800 font-medium">
                                  x{item.cantidad}
                                </span>
                              </div>
                              <div className="font-semibold text-pastel-pink-950">
                                ${((item.precio_unitario || 0) * item.cantidad).toFixed(2)}
                                <span className="text-[10px] text-pastel-pink-700 ml-1 font-normal">
                                  (${item.precio_unitario} c/u)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total final */}
                      <div className="pt-2 border-t border-pastel-pink-200 flex justify-between items-center text-sm">
                        <span className="font-bold text-pastel-pink-900">Total acumulado:</span>
                        <span className="font-extrabold text-pastel-pink-950 text-base">
                          ${(ped.total || 0).toFixed(2)} ARS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
