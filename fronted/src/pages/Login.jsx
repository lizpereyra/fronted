import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { guardarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.statePath || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      guardarSesion(res.access_token, res.usuario);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUser = async () => {
    setEmail("cliente@dulcevicio.com");
    setPassword("dulce123");
    setLoading(true);
    setError(null);
    try {
      const res = await login("cliente@dulcevicio.com", "dulce123");
      guardarSesion(res.access_token, res.usuario);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error en usuario demo:", err);
      setError("Error al ingresar con cuenta demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 flex items-center justify-center p-4 font-sans text-pastel-pink-900">
      <div className="bg-white rounded-3xl p-8 border border-pastel-pink-200 shadow-md max-w-md w-full text-left">
        
        <div className="text-center mb-6">
          <span className="text-5xl select-none block mb-2">🧁</span>
          <h2 className="text-2xl font-bold text-pastel-pink-950 font-serif m-0">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-pastel-pink-900 mt-1 m-0">
            Ingresa a tu cuenta para realizar tus pedidos en Dulce Vicio.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@dulcevicio.com"
              className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 text-sm text-pastel-pink-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 text-sm text-pastel-pink-950"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Ingresando…" : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-pastel-pink-100 flex flex-col gap-2">
          <button
            onClick={handleDemoUser}
            type="button"
            className="w-full py-2.5 rounded-xl bg-pastel-pink-100 hover:bg-pastel-pink-200 text-pastel-pink-950 font-bold text-xs border border-pastel-pink-300 transition-all cursor-pointer"
          >
            👤 Ingresar con Usuario Demo (cliente@dulcevicio.com)
          </button>

          <p className="text-center text-xs text-pastel-pink-900 mt-2 m-0">
            ¿No tienes una cuenta aún?{" "}
            <Link to="/registro" className="font-bold text-pastel-pink-950 underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
