const API_URL = "http://localhost:8000";

export async function getProductos({ page = 0, limit = 6, nombre = "" } = {}) {
  const params = new URLSearchParams({ skip: page * limit, limit });
  if (nombre) params.append("nombre", nombre);
  const respuesta = await fetch(`${API_URL}/productos?${params}`);
  if (!respuesta.ok) throw new Error("Error al consultar el backend");
  return respuesta.json();
}

export const fetchProductos = getProductos;

export async function comprarProductos(items) {
  const res = await fetch(`${API_URL}/productos/comprar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Error al realizar la compra");
  }
  
  return res.json();
}
