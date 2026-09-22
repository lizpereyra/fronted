/**
 * Helper para obtener la URL completa de la imagen de un producto.
 * Soporta tanto imágenes públicas locales (/images/...) como subidas al backend.
 * @param {Object} producto 
 * @returns {string|null}
 */
export function urlImagen(producto) {
  if (!producto) return null;
  const path = producto.imagen_url || producto.imagen;
  if (!path) return null;

  // URL absoluta externa
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Si es un recurso público de la app web (ej. /images/tiramisu.jpg)
  if (path.startsWith("/images/")) {
    return path;
  }

  // Si es una ruta servida desde la API del backend
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}
