import React, { createContext, useContext, useState, useEffect } from "react";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem("dulce_vicio_carrito");
      return guardado ? JSON.parse(guardado) : [];
    } catch (e) {
      console.error("Error al leer el carrito desde localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("dulce_vicio_carrito", JSON.stringify(items));
    } catch (e) {
      console.error("Error al guardar el carrito en localStorage:", e);
    }
  }, [items]);

  const agregar = (producto, cantidad = 1) => {
    setItems(prevItems => {
      const existeIndex = prevItems.findIndex(i => i.producto.id === producto.id);
      if (existeIndex > -1) {
        const nuevos = [...prevItems];
        nuevos[existeIndex] = {
          ...nuevos[existeIndex],
          cantidad: nuevos[existeIndex].cantidad + cantidad
        };
        return nuevos;
      } else {
        return [...prevItems, { producto, cantidad }];
      }
    });
  };

  const quitar = (producto_id) => {
    setItems(prevItems => prevItems.filter(i => i.producto.id !== producto_id));
  };

  const vaciar = () => {
    setItems([]);
  };

  const total = items.reduce(
    (acc, item) => acc + item.producto.precio_final * item.cantidad,
    0
  );

  const cantidadTotal = items.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregar,
        quitar,
        vaciar,
        total,
        cantidadTotal
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe ser usado dentro de un CarritoProvider");
  }
  return context;
}
