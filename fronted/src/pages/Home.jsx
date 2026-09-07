import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-pastel-pink-50 flex flex-col font-sans text-pastel-pink-900">
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 text-center bg-gradient-to-b from-pastel-pink-100 via-pastel-pink-50 to-pastel-pink-50 border-b border-pastel-pink-200 overflow-hidden">
        {/* Floating emojis background decorative */}
        <div className="absolute top-10 left-10 text-8xl select-none opacity-20 animate-float pointer-events-none">🧁</div>
        <div className="absolute bottom-10 right-10 text-8xl select-none opacity-20 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🍰</div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-pastel-pink-200 text-pastel-pink-950 text-xs font-bold uppercase tracking-widest mb-4 shadow-2xs">
            Pastelería Artesanal de Ensueño
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-pastel-pink-950 font-serif mb-6 leading-tight">
            Bienvenido a Dulce Vicio - Pastelería Artesanal
          </h1>

          <p className="text-base md:text-xl text-pastel-pink-900 max-w-2xl mx-auto font-sans leading-relaxed mb-8">
            Elaboramos cada torta, postre y dulzura con ingredientes seleccionados y el amor de la repostería hecha en casa. Haz tu pedido online hoy mismo.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/catalogo"
              className="px-8 py-4 rounded-2xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-decoration-none active:scale-95"
            >
              🍰 Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Highlights Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-pastel-pink-950 font-serif mb-3">
            ¿Por qué elegir Dulce Vicio?
          </h2>
          <p className="text-sm md:text-base text-pastel-pink-900 max-w-xl mx-auto m-0">
            Descubre lo que hace única a nuestra propuesta gastronómica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-pastel-pink-200 shadow-xs text-center hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-pastel-pink-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🍓
            </div>
            <h3 className="text-xl font-bold text-pastel-pink-950 font-serif mb-2">Ingredientes Frescos</h3>
            <p className="text-sm text-pastel-pink-900 leading-relaxed m-0">
              Seleccionamos las mejores materias primas y frutas de estación sin conservantes artificiales.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-pastel-pink-200 shadow-xs text-center hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-pastel-pink-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              👩‍🍳
            </div>
            <h3 className="text-xl font-bold text-pastel-pink-950 font-serif mb-2">Elaboración Artesanal</h3>
            <p className="text-sm text-pastel-pink-900 leading-relaxed m-0">
              Recetas familiares perfeccionadas para garantizar el sabor clásico y textura inigualable.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-pastel-pink-200 shadow-xs text-center hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-pastel-pink-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🚚
            </div>
            <h3 className="text-xl font-bold text-pastel-pink-950 font-serif mb-2">Envíos Rápidos</h3>
            <p className="text-sm text-pastel-pink-900 leading-relaxed m-0">
              Entregas cuidadas a domicilio para mantener la frescura e integridad de cada producto.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Call to Action Banner */}
      <section className="bg-pastel-pink-100 border-t border-b border-pastel-pink-200 py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-pastel-pink-950 font-serif mb-3">
            ¿Tentado con nuestros postres?
          </h3>
          <p className="text-sm md:text-base text-pastel-pink-900 mb-6 m-0">
            Explora la variedad de Tiramisú, Chocotorta, Brownies y más en nuestro catálogo interactivo.
          </p>
          <Link
            to="/catalogo"
            className="px-8 py-3.5 rounded-xl bg-pastel-pink-600 hover:bg-pastel-pink-700 text-white font-bold text-sm shadow-xs transition-all inline-block text-decoration-none"
          >
            Ver Catálogo Completo
          </Link>
        </div>
      </section>

    </div>
  );
}
