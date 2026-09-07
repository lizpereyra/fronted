import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ statePath: location.pathname }} replace />;
  }

  return children;
}
