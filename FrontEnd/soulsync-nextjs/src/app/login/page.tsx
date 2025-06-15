'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './styles.css'; // Importamos los estilos específicos para la página de login

/**
 * Componente LoginPage
 * 
 * Este componente representa la página de inicio de sesión de la aplicación SoulSync.
 * Incluye un formulario de login con efectos visuales y animaciones para mejorar
 * la experiencia de usuario.
 * 
 * @returns {JSX.Element} - Componente de página de login
 */
export default function LoginPage() {
  // Estados para controlar los campos del formulario
  const [correo, setCorreo] = useState(''); // Estado para el campo de correo electrónico
  const [password, setPassword] = useState(''); // Estado para el campo de contraseña
  
  // Estados para controlar la interfaz y las animaciones
  const [error, setError] = useState(''); // Almacena mensajes de error para mostrar al usuario
  const [isLoading, setIsLoading] = useState(false); // Controla el estado de carga durante la petición
  const [animateBackground, setAnimateBackground] = useState(false); // Activa la animación del fondo
  const [buttonClicked, setButtonClicked] = useState(false); // Controla la animación del botón
  const [showExplosion, setShowExplosion] = useState(false); // Controla la animación de explosión
  
  const router = useRouter(); // Hook para la navegación entre páginas

  // Generar posiciones de partículas una sola vez con useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

  // Generar posiciones de partículas de explosión una sola vez
  const explosionParticles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      transform: `rotate(${i * 18}deg) translateY(-50px)`,
      animationDelay: `${i * 0.02}s`
    }));
  }, []);

  /**
   * Efecto que activa la animación del fondo al cargar el componente
   */
  useEffect(() => {
    setAnimateBackground(true);
  }, []);

  /**
   * Efecto que resetea la animación de explosión después de completarse
   */
  useEffect(() => {
    if (showExplosion) {
      const timer = setTimeout(() => {
        setShowExplosion(false);
      }, 1000);
      return () => clearTimeout(timer); // Limpieza del timeout al desmontar
    }
  }, [showExplosion]);

  /**
   * Maneja el envío del formulario de login
   * 
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setError(''); // Limpia errores previos
    setButtonClicked(true); // Activa la animación del botón
    setShowExplosion(true); // Activa la animación de explosión
    setIsLoading(true); // Activa el estado de carga

    console.log(correo, password); // Log para depuración

    try {
      // Simulamos un pequeño retraso para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Realizamos la petición a la API de Symfony
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }), // Enviamos las credenciales
      });

      const data = await res.json(); // Parseamos la respuesta

      // Si la respuesta no es exitosa, mostramos el error
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setIsLoading(false);
        setButtonClicked(false);
        return;
      }

      // Guardamos el token en localStorage para mantener la sesión
      localStorage.setItem('token', data.token);

      // Verificamos si el usuario ya tiene un perfil creado
      const perfilRes = await fetch('http://localhost:8000/api/perfiles/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`, // Usamos el token para autenticar
        },
      });

      const perfilData = await perfilRes.json();

      // Redirigimos según si tiene perfil o no
      if (!perfilData.perfil_creado) {
        router.push('/perfil/crear'); // Si no tiene perfil, lo enviamos a crear uno
      } else {
        router.push('/home'); // Si ya tiene perfil, lo enviamos al home
      }
    } catch (err) {
      // Manejamos errores inesperados
      setError('Error inesperado al iniciar sesión');
      setIsLoading(false);
      setButtonClicked(false);
    }
  };

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-violet-900 p-6 overflow-hidden relative ${animateBackground ? 'animate-gradient' : ''}`}>
      {/* Elementos de brillo en el fondo para crear profundidad */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
        <div className="glow-3"></div>
      </div>

      {/* Partículas flotantes que añaden dinamismo al fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((style, i) => (
          <div 
            key={i}
            className="particle"
            style={style}
          ></div>
        ))}
      </div>

      {/* Animación de explosión que se muestra al hacer clic en el botón */}
      {showExplosion && (
        <div className="explosion-container">
          <div className="explosion-ring"></div>
          <div className="explosion-particles">
            {explosionParticles.map((style, i) => (
              <div 
                key={i} 
                className="explosion-particle"
                style={style}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta principal con el formulario de login */}
      <div className={`w-full max-w-md bg-gradient-to-br from-purple-600/90 to-blue-400/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-blue-300/40 transition-all duration-500 hover:shadow-blue-400/60 relative z-10 shadow-[0_0_25px_rgba(165,180,252,0.5)] ${buttonClicked ? 'animate-card-success' : ''}`}>
        {/* Efecto de brillo que recorre la tarjeta */}
        <div className="card-shine"></div>
        {/* Resplandor pulsante alrededor de la tarjeta */}
        <div className="card-glow"></div>
        
        {/* Cabecera con logo y título */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse-slow">
              <span className="text-white text-2xl font-bold">SS</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent animate-shimmer">
            SoulSync
          </h1>
          <p className="text-white mt-2 font-medium">
            Conecta con almas afines
          </p>
        </div>

        {/* Contenedor del formulario */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo de correo electrónico */}
            <div className="relative group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-300/60 bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition-all placeholder:text-blue-200/70 group-hover:border-blue-400/80 cursor-text"
              />
              {/* Efecto de hover para el input */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>

            {/* Campo de contraseña */}
            <div className="relative group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-300/60 bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition-all placeholder:text-blue-200/70 group-hover:border-blue-400/80 cursor-text"
              />
              {/* Efecto de hover para el input */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>

            {/* Mensaje de error (condicional) */}
            {error && (
              <div className="bg-red-500/40 text-red-100 p-3 rounded-lg text-sm backdrop-blur-sm border border-red-500/50 animate-fade-in">
                {error}
              </div>
            )}

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 group cursor-pointer"
            >
              {/* Texto del botón con animación de desaparición */}
              <span className={`relative z-10 flex justify-center items-center ${buttonClicked && !isLoading ? 'animate-text-disappear' : ''}`}>
                {isLoading ? (
                  // Spinner de carga
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Iniciar Sesión'
                )}
              </span>
              
              {/* Efectos de hover para el botón */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
              <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 bg-gradient-to-r from-blue-400/20 to-purple-500/20 origin-left transition-transform duration-500"></span>
              
              {/* Elementos de animación de éxito al hacer clic */}
              {buttonClicked && !isLoading && (
                <>
                  {/* Relleno del botón */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 animate-button-fill"></span>
                  {/* Icono de marca de verificación */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-success-mark">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Enlace para registro de nuevos usuarios */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              ¿Aún no tienes cuenta?{' '}
              <a
                href="/register"
                className="text-blue-200 font-medium hover:text-white transition-colors relative group cursor-pointer"
              >
                Regístrate
                {/* Efecto de subrayado animado */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Pie de página con copyright */}
      <div className="mt-8 text-center text-white text-xs">
        © {new Date().getFullYear()} SoulSync. Todos los derechos reservados.
      </div>
    </main>
  );
}
