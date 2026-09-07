import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("dulce_vicio_token") || null;
    } catch {
      return null;
    }
  });

  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem("dulce_vicio_usuario");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const guardarSesion = (tokenStr, usuarioObj) => {
    setToken(tokenStr);
    setUsuario(usuarioObj);
    try {
      localStorage.setItem("dulce_vicio_token", tokenStr);
      localStorage.setItem("dulce_vicio_usuario", JSON.stringify(usuarioObj));
    } catch (e) {
      console.error("Error al guardar sesión:", e);
    }
  };

  const cerrarSesion = () => {
    setToken(null);
    setUsuario(null);
    try {
      localStorage.removeItem("dulce_vicio_token");
      localStorage.removeItem("dulce_vicio_usuario");
    } catch (e) {
      console.error("Error al remover sesión:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, usuario, guardarSesion, cerrarSesion, estaAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
