const API_URL = "http://localhost:8000";

export async function fetchProductos() {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) {
    throw new Error("No se pudo obtener el catálogo de productos");
  }
  return res.json();
}

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
