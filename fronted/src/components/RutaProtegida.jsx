import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children, requiereAdmin = false }) {
  const { estaAutenticado, usuario } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ statePath: location.pathname }} replace />;
  }

  if (requiereAdmin && usuario?.rol !== "admin") {
    return <Navigate to="/catalogo" state={{ avisoAdmin: "⚠️ Acceso denegado. El Panel de Administración requiere el rol de Administrador." }} replace />;
  }

  return children;
}
