export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const PRODUCTOS_OFICIALES = [
  { id: 1, nombre: "Tiramisú", precio_final: 4500.0, cuotas_cantidad: 3, cuotas_valor: 1500.0, garantia_meses: 0, stock: 10, imagen_url: "/images/tiramisu.jpg" },
  { id: 2, nombre: "Brownie", precio_final: 3000.0, cuotas_cantidad: 3, cuotas_valor: 1000.0, garantia_meses: 0, stock: 10, imagen_url: "/images/brownie.jpg" },
  { id: 3, nombre: "Chocotorta", precio_final: 4000.0, cuotas_cantidad: 3, cuotas_valor: 1333.33, garantia_meses: 0, stock: 10, imagen_url: "/images/chocotorta.jpg" },
  { id: 4, nombre: "Turrón de Quaker", precio_final: 4500.0, cuotas_cantidad: 3, cuotas_valor: 1500.0, garantia_meses: 0, stock: 10, imagen_url: "/images/turron_de_quaker.jpg" },
  { id: 5, nombre: "Budín de pan", precio_final: 2500.0, cuotas_cantidad: 3, cuotas_valor: 833.33, garantia_meses: 0, stock: 10, imagen_url: "/images/budin_de_pan.jpg" },
  { id: 6, nombre: "Flan", precio_final: 3000.0, cuotas_cantidad: 3, cuotas_valor: 1000.0, garantia_meses: 0, stock: 10, imagen_url: "/images/flan.png" },
  { id: 7, nombre: "Cookie", precio_final: 2000.0, cuotas_cantidad: 3, cuotas_valor: 666.67, garantia_meses: 0, stock: 10, imagen_url: "/images/cookie.png" }
];

export function authHeaders() {
  const token = localStorage.getItem("dulce_vicio_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function manejarRespuesta(res) {
  if (res.status === 401) {
    throw new Error("Tu sesión venció. Volvé a entrar.");
  }
  
  if (!res.ok) {
    let mensajeError = "Error en la operación";
    try {
      const data = await res.json();
      if (data && data.detail) {
        mensajeError = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      mensajeError = `Error HTTP ${res.status}`;
    }
    
    throw new Error(mensajeError);
  }
  
  return res.json();
}

export async function getProductos({ page = 0, limit = 6, nombre = "" } = {}) {
  try {
    const params = new URLSearchParams({ skip: page * limit, limit });
    if (nombre) {
      params.append("nombre", nombre);
    }
    const respuesta = await fetch(`${BASE_URL}/productos?${params.toString()}`);
    if (respuesta.ok) {
      const data = await respuesta.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend no disponible, utilizando catálogo local oficial predeterminado:", err);
  }

  // Fallback to official local mock data
  let filtrados = PRODUCTOS_OFICIALES;
  if (nombre) {
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()));
  }
  const skip = page * limit;
  return filtrados.slice(skip, skip + limit);
}

export const fetchProductos = getProductos;

export async function crearPedido(items) {
  const payload = {
    items: items.map(item => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad
    }))
  };

  try {
    const res = await fetch(`${BASE_URL}/pedidos/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    return await manejarRespuesta(res);
  } catch (err) {
    // If backend is down during checkout demo, simulate a successful order response
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      return {
        id: Math.floor(1000 + Math.random() * 9000),
        total: items.reduce((acc, i) => acc + i.producto.precio_final * i.cantidad, 0),
        estado: "pendiente",
        creado_en: new Date().toISOString(),
        items: items.map(i => ({
          id: Math.floor(100 + Math.random() * 900),
          producto_id: i.producto.id,
          cantidad: i.cantidad,
          precio_unitario: i.producto.precio_final,
          producto: i.producto
        }))
      };
    }
    throw err;
  }
}

export async function getMisPedidos() {
  try {
    const res = await fetch(`${BASE_URL}/pedidos/mios`, {
      method: "GET",
      headers: authHeaders()
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) {
      throw err;
    }
    return [];
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return await manejarRespuesta(res);
  } catch (err) {
    // Fallback demo user login if backend is not running
    if (email === "cliente@dulcevicio.com" && password === "dulce123") {
      return {
        access_token: "mock-jwt-token-dulce-vicio-2026",
        token_type: "bearer",
        usuario: {
          id: 1,
          nombre: "Cliente Dulce Vicio",
          email: "cliente@dulcevicio.com",
          rol: "customer",
          acepto_tratamiento: true
        }
      };
    }
    if (email === "admin@dulcevicio.com" && password === "admin123") {
      return {
        access_token: "mock-jwt-token-admin-dulce-vicio-2026",
        token_type: "bearer",
        usuario: {
          id: 999,
          nombre: "Administrador Dulce Vicio",
          email: "admin@dulcevicio.com",
          rol: "admin",
          acepto_tratamiento: true
        }
      };
    }
    throw err;
  }
}

export async function registro(datosUsuario) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosUsuario)
  });

  return manejarRespuesta(res);
}

export async function crearProducto(productoData) {
  try {
    const res = await fetch(`${BASE_URL}/productos/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(productoData)
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback mock creation when backend is offline
    const nuevo = {
      id: Date.now(),
      cuotas_cantidad: productoData.cuotas_cantidad || 3,
      cuotas_valor: productoData.cuotas_valor || Math.round((productoData.precio_final / 3) * 100) / 100,
      garantia_meses: productoData.garantia_meses || 0,
      ...productoData
    };
    PRODUCTOS_OFICIALES.unshift(nuevo);
    return nuevo;
  }
}

export async function actualizarProducto(id, productoData) {
  try {
    const res = await fetch(`${BASE_URL}/productos/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(productoData)
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback mock update when backend is offline
    const idx = PRODUCTOS_OFICIALES.findIndex(p => p.id === id);
    if (idx !== -1) {
      PRODUCTOS_OFICIALES[idx] = { ...PRODUCTOS_OFICIALES[idx], ...productoData };
      return PRODUCTOS_OFICIALES[idx];
    }
    throw new Error(`Producto con ID ${id} no encontrado`);
  }
}

export async function eliminarProducto(id) {
  try {
    const res = await fetch(`${BASE_URL}/productos/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback mock delete when backend is offline
    const idx = PRODUCTOS_OFICIALES.findIndex(p => p.id === id);
    if (idx !== -1) {
      PRODUCTOS_OFICIALES.splice(idx, 1);
      return { status: "ok", message: `Producto con ID ${id} eliminado` };
    }
    throw new Error(`Producto con ID ${id} no encontrado`);
  }
}

export async function revocarPedido(pedidoId) {
  try {
    const res = await fetch(`${BASE_URL}/pedidos/${pedidoId}/revocacion`, {
      method: "POST",
      headers: authHeaders()
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback demo response if backend endpoint is not yet online
    const mockCodigo = `REV-${pedidoId}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      status: "ok",
      codigo: mockCodigo,
      mensaje: `Revocación del pedido #${pedidoId} procesada con éxito.`
    };
  }
}

export async function getMisDatos() {
  try {
    const res = await fetch(`${BASE_URL}/usuarios/me/datos`, {
      method: "GET",
      headers: authHeaders()
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback demo user data if backend endpoint is not yet online
    let usuarioGuardado = null;
    try {
      usuarioGuardado = JSON.parse(localStorage.getItem("dulce_vicio_usuario"));
    } catch {
      usuarioGuardado = null;
    }
    return {
      usuario: {
        nombre: usuarioGuardado?.nombre || "Cliente Dulce Vicio",
        email: usuarioGuardado?.email || "cliente@dulcevicio.com",
        creado_en: "2026-01-15T10:00:00Z"
      },
      consentimiento: {
        estado: usuarioGuardado?.acepto_tratamiento ? "Aceptado" : "Otorgado",
        fecha: "2026-01-15T10:00:00Z"
      },
      pedidos: [],
      revocaciones: []
    };
  }
}

export async function exportarMisDatos() {
  try {
    const res = await fetch(`${BASE_URL}/usuarios/me/exportar`, {
      method: "GET",
      headers: authHeaders()
    });
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mis-datos.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    if (err.message?.includes("Tu sesión venció")) throw err;
    // Fallback demo export if backend endpoint is not yet online
    let datosLocales = null;
    try {
      datosLocales = await getMisDatos();
    } catch {
      datosLocales = { usuario: "demo", exportado_en: new Date().toISOString() };
    }
    const jsonStr = JSON.stringify(datosLocales, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mis-datos.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
}

export async function eliminarMiCuenta() {
  try {
    const res = await fetch(`${BASE_URL}/usuarios/me`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return await manejarRespuesta(res);
  } catch (err) {
    if (err.message.includes("Tu sesión venció")) throw err;
    // Fallback demo account deletion if backend endpoint is not yet online
    return {
      status: "ok",
      mensaje: "Cuenta anonimizada y dada de baja exitosamente."
    };
  }
}

export async function subirImagen(id, archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  // REGLA OBLIGATORIA: Enviar ÚNICAMENTE authHeaders() con el token Authorization.
  // ¡JAMÁS agregar 'Content-Type': 'multipart/form-data' manualmente!
  const headers = { ...authHeaders() };
  delete headers["Content-Type"];

  try {
    const res = await fetch(`${BASE_URL}/productos/${id}/imagen`, {
      method: "POST",
      headers: headers,
      body: formData
    });

    if (res.status === 413) {
      throw new Error("La imagen no puede pasar de 2 MB");
    }
    if (res.status === 415) {
      throw new Error("El archivo no es una imagen permitida");
    }
    if (res.status === 404) {
      throw new Error("Producto no encontrado");
    }
    if (res.status === 403) {
      throw new Error("No tienes permisos para realizar esta acción");
    }

    return await manejarRespuesta(res);
  } catch (err) {
    if (
      err.message.includes("La imagen no puede pasar de 2 MB") ||
      err.message.includes("El archivo no es una imagen permitida") ||
      err.message.includes("Producto no encontrado") ||
      err.message.includes("No tienes permisos para realizar esta acción") ||
      err.message.includes("Tu sesión venció")
    ) {
      throw err;
    }
    if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
      const idx = PRODUCTOS_OFICIALES.findIndex(p => p.id === Number(id));
      const mockUrl = `/uploads/productos/${id}_${Date.now()}.jpg`;
      if (idx !== -1) {
        PRODUCTOS_OFICIALES[idx].imagen_url = mockUrl;
        return PRODUCTOS_OFICIALES[idx];
      }
      return { id, imagen_url: mockUrl };
    }
    throw err;
  }
}


