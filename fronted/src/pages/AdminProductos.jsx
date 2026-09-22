import React, { useState, useEffect, useRef } from "react";
import { getProductos, actualizarProducto, subirImagen, crearProducto } from "../services/api";
import { urlImagen } from "../utils/imagenes";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Campos del Formulario de Edición
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("");

  // Manejo de Input de Archivo (NO controlado) y Vista Previa Local
  const fileInputRef = useRef(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [errorImagen, setErrorImagen] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeStatus, setMensajeStatus] = useState(null);

  // Cargar lista de productos al montar
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const data = await getProductos({ limit: 100 });
      setProductos(data || []);
      if (data && data.length > 0 && !productoSeleccionado) {
        seleccionarProducto(data[0]);
      }
    } catch (err) {
      console.error("Error al cargar productos para administración:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Limpieza de ObjectURL de la vista previa para liberar memoria
  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const seleccionarProducto = (p) => {
    setProductoSeleccionado(p);
    setNombre(p.nombre || "");
    setPrecio(p.precio_final ?? p.precio ?? 0);
    setDescripcion(p.descripcion || "");
    setCategoria(p.categoria || "Postres");
    setStock(p.stock ?? 0);
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

  // Guardar Cambios de Nombre, Precio, Descripción, Categoría y Stock
  const handleGuardarDatos = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return;

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
      const actualizado = await actualizarProducto(productoSeleccionado.id, payload);
      setProductoSeleccionado(actualizado);
      setMensajeStatus({ type: "success", text: "✅ Producto actualizado con éxito." });
      await cargarProductos();
    } catch (err) {
      setMensajeStatus({ type: "error", text: `❌ Error al actualizar: ${err.message}` });
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

  const currentImgUrl = urlImagen(productoSeleccionado);

  return (
    <div className="min-h-screen bg-pastel-pink-50 py-10 px-4 md:px-8 font-sans text-pastel-pink-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pastel-pink-950 font-serif m-0">
              🛠️ Panel de Gestión de Catálogo e Imágenes
            </h1>
            <p className="text-xs md:text-sm text-pastel-pink-900 mt-1 m-0">
              Edita información de productos y gestiona las fotografías del catálogo oficial.
            </p>
          </div>

          <button
            onClick={cargarProductos}
            className="px-4 py-2 rounded-xl bg-white hover:bg-pastel-pink-100 border border-pastel-pink-300 font-bold text-xs text-pastel-pink-900 transition-all shadow-2xs self-start md:self-auto cursor-pointer"
          >
            🔄 Recargar Catálogo
          </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          {/* Columna 1: Lista de Productos */}
          <div className="bg-white rounded-3xl p-6 border border-pastel-pink-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-pastel-pink-950 font-serif m-0 border-b border-pastel-pink-100 pb-3 flex items-center justify-between">
              <span>🍰 Seleccionar Producto</span>
              <span className="text-xs bg-pastel-pink-100 px-2.5 py-0.5 rounded-full text-pastel-pink-900 font-sans font-bold">
                {productos.length}
              </span>
            </h3>

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
                  const isSelected = productoSeleccionado?.id === prod.id;
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

          {/* Columna 2 & 3: Formulario de Edición y Subida de Imagen */}
          {productoSeleccionado ? (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bloque 1: Edición de Datos Principales */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-pastel-pink-200 shadow-xs space-y-6">
                <div className="border-b border-pastel-pink-100 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-pastel-pink-800 uppercase tracking-wider block">
                      Editando Producto #{productoSeleccionado.id}
                    </span>
                    <h2 className="text-2xl font-bold text-pastel-pink-950 font-serif m-0">
                      {productoSeleccionado.nombre}
                    </h2>
                  </div>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white text-pastel-pink-950 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="px-6 py-2.5 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 active:bg-pastel-pink-800 text-white font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {guardando ? "Guardando…" : "💾 Guardar Cambios del Producto"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bloque 2: Subida y Gestión de Imagen (Clase 10) */}
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
                      
                      {/* Input de archivo NO controlado (SIN atributo value) */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-pastel-pink-900 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pastel-pink-600 file:text-white hover:file:bg-pastel-pink-700 file:cursor-pointer cursor-pointer border border-pastel-pink-300 rounded-xl bg-white p-1"
                      />
                    </div>

                    {/* Mensaje de Error de Imagen */}
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

            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-pastel-pink-200 text-center shadow-xs flex flex-col items-center justify-center">
              <span className="text-5xl mb-3">👈</span>
              <p className="text-base font-bold text-pastel-pink-950 m-0">Selecciona un producto de la lista para editarlo.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
