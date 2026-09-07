import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registro } from "../services/api";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Mandatory check for Ley 25.326 - Unchecked by default
  const [aceptoTratamiento, setAceptoTratamiento] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { guardarSesion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aceptoTratamiento) {
      setError("Debes aceptar el tratamiento de tus datos personales conforme a la Ley 25.326.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await registro({
        nombre,
        email,
        password,
        acepto_tratamiento: aceptoTratamiento
      });
      guardarSesion(res.access_token, res.usuario);
      navigate("/catalogo");
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al registrar la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-pink-50 flex items-center justify-center p-4 font-sans text-pastel-pink-900">
      <div className="bg-white rounded-3xl p-8 border border-pastel-pink-200 shadow-md max-w-md w-full text-left">
        
        <div className="text-center mb-6">
          <span className="text-5xl select-none block mb-2">🌸</span>
          <h2 className="text-2xl font-bold text-pastel-pink-950 font-serif m-0">
            Crear Cuenta
          </h2>
          <p className="text-xs text-pastel-pink-900 mt-1 m-0">
            Únete a la experiencia dulce de Dulce Vicio.
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
              Nombre Completo
            </label>
            <input 
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="María Pérez"
              className="w-full px-4 py-2.5 rounded-xl border border-pastel-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pastel-pink-500 text-sm text-pastel-pink-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-pink-900 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@correo.com"
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

          {/* Ley 25.326 Mandatory Checkbox - Unchecked by default */}
          <div className="bg-pastel-pink-50/70 p-3 rounded-xl border border-pastel-pink-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="aceptoLey25326"
              checked={aceptoTratamiento}
              onChange={(e) => setAceptoTratamiento(e.target.checked)}
              className="mt-0.5 rounded accent-pink-600 cursor-pointer w-4 h-4"
            />
            <label htmlFor="aceptoLey25326" className="text-xs text-pastel-pink-950 leading-snug cursor-pointer select-none">
              Acepto el tratamiento de mis datos personales según la <strong>Ley 25.326</strong>.
            </label>
          </div>

          {/* Creation Button Disabled until Checkbox is Checked */}
          <button
            type="submit"
            disabled={loading || !aceptoTratamiento}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-xs transition-all cursor-pointer ${
              loading || !aceptoTratamiento
                ? "bg-pastel-pink-300 cursor-not-allowed opacity-60"
                : "bg-pastel-pink-600 hover:bg-pastel-pink-700 active:scale-95 shadow-md"
            }`}
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-pastel-pink-100 text-center">
          <p className="text-xs text-pastel-pink-900 m-0">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-bold text-pastel-pink-950 underline">
              Ingresa aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
