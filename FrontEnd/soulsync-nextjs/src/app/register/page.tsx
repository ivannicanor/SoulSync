'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './styles.css'; // Importamos los estilos específicos para la página de registro

/**
 * Componente RegisterPage
 * 
 * Este componente representa la página de registro de la aplicación SoulSync.
 * Incluye un formulario de registro con efectos visuales y animaciones para mejorar
 * la experiencia de usuario.
 * 
 * @returns {JSX.Element} - Componente de página de registro
 */
export default function RegisterPage() {
  // Estados para controlar los campos del formulario
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    passwordConfirm: '',
  });
  
  // Estados para controlar la interfaz y las animaciones
  const [error, setError] = useState(''); // Almacena mensajes de error para mostrar al usuario
  const [loading, setLoading] = useState(false); // Controla el estado de carga durante la petición
  const [animateBackground, setAnimateBackground] = useState(false); // Activa la animación del fondo
  const [buttonClicked, setButtonClicked] = useState(false); // Controla la animación del botón
  const [showConfetti, setShowConfetti] = useState(false); // Controla la animación de confeti
  const [passwordStrength, setPasswordStrength] = useState(0); // Fuerza de la contraseña (0-3)
  
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

  // Generar posiciones de confeti una sola vez
  const confettiParticles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `-5%`,
      backgroundColor: [
        '#8b5cf6', // Morado
        '#60a5fa', // Azul
        '#a78bfa', // Lavanda
        '#93c5fd', // Azul claro
      ][Math.floor(Math.random() * 4)],
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 20 + 10}px`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
    }));
  }, []);

  /**
   * Efecto que activa la animación del fondo al cargar el componente
   */
  useEffect(() => {
    setAnimateBackground(true);
  }, []);

  /**
   * Efecto que resetea la animación de confeti después de completarse
   */
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer); // Limpieza del timeout al desmontar
    }
  }, [showConfetti]);

  /**
   * Evalúa la fortaleza de la contraseña
   * @param {string} password - La contraseña a evaluar
   * @returns {number} - Puntuación de fortaleza (0-3)
   */
  const evaluatePasswordStrength = (password: string): number => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    
    return score;
  };

  /**
   * Maneja los cambios en los campos del formulario
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio
   */
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Evaluar fortaleza de contraseña si el campo es password
    if (name === 'password') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };

  /**
   * Maneja el envío del formulario de registro
   * 
   * @param {React.FormEvent} e - Evento del formulario
   */
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setError(''); // Limpia errores previos
    
    // Validaciones básicas
    if (formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setButtonClicked(true); // Activa la animación del botón
    setLoading(true); // Activa el estado de carga
    
    const token = localStorage.getItem('token');
    
    try {
      // Simulamos un pequeño retraso para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Realizamos la petición a la API de Symfony
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          correo: formData.correo,
          password: formData.password,
        }),
      });

      const data = await res.json(); // Parseamos la respuesta

      // Si la respuesta no es exitosa, mostramos el error
      if (!res.ok) {
        setError(data.error || 'Error al registrar usuario');
        setLoading(false);
        setButtonClicked(false);
        return;
      }

      // Activamos la animación de confeti para celebrar el registro exitoso
      setShowConfetti(true);
      
      // Esperamos un momento antes de redirigir para mostrar la animación
      setTimeout(() => {
        // Registro exitoso, redirigir a login
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      // Manejamos errores inesperados
      setError('Error al conectar con el servidor');
      setLoading(false);
      setButtonClicked(false);
    }
  };

  /**
   * Renderiza el indicador de fortaleza de la contraseña
   */
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const labels = ['Débil', 'Media', 'Fuerte'];
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
    
    return (
      <div className="mt-1 mb-2">
        <div className="flex gap-1 h-1">
          {[0, 1, 2].map((level) => (
            <div 
              key={level} 
              className={`flex-1 rounded-full ${level < passwordStrength ? colors[passwordStrength - 1] : 'bg-gray-300'}`}
            />
          ))}
        </div>
        <p className="text-xs mt-1 text-right text-blue-200">
          {formData.password ? labels[passwordStrength - 1] || 'Débil' : ''}
        </p>
      </div>
    );
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

      {/* Animación de confeti que se muestra al completar el registro */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiParticles.map((style, i) => (
            <div 
              key={i} 
              className="confetti"
              style={style}
            ></div>
          ))}
        </div>
      )}

      {/* Tarjeta principal con el formulario de registro */}
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
            Crea tu cuenta y encuentra almas afines
          </p>
        </div>

        {/* Contenedor del formulario */}
        <div className="px-8 pb-8">
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            {/* Campo de correo electrónico */}
            <div className="relative group">
              <input
                type="email"
                name="correo"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={manejarCambio}
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
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={manejarCambio}
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-300/60 bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition-all placeholder:text-blue-200/70 group-hover:border-blue-400/80 cursor-text"
              />
              {/* Efecto de hover para el input */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>
            
            {/* Indicador de fortaleza de contraseña */}
            {renderPasswordStrength()}

            {/* Campo de confirmación de contraseña */}
            <div className="relative group">
              <input
                type="password"
                name="passwordConfirm"
                placeholder="Confirmar contraseña"
                value={formData.passwordConfirm}
                onChange={manejarCambio}
                required
                className={`w-full px-4 py-3 rounded-xl border border-blue-300/60 bg-indigo-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition-all placeholder:text-blue-200/70 group-hover:border-blue-400/80 cursor-text ${
                  formData.password && formData.passwordConfirm && formData.password === formData.passwordConfirm ? 'border-green-400/60' : ''
                }`}
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

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={loading || buttonClicked}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-400 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 group cursor-pointer register-button-animation mt-2"
            >
              {/* Texto del botón con animación de desaparición */}
              <span className={`relative z-10 flex justify-center items-center ${buttonClicked && !loading ? 'animate-text-disappear' : ''}`}>
                {loading ? (
                  // Spinner de carga
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Registrarse'
                )}
              </span>
              
              {/* Efectos de hover para el botón */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
              <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 bg-gradient-to-r from-blue-400/20 to-purple-500/20 origin-left transition-transform duration-500"></span>
              
              {/* Elementos de animación de éxito al hacer clic */}
              {buttonClicked && !loading && (
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

          {/* Enlace para iniciar sesión */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/login"
                className="text-blue-200 font-medium hover:text-white transition-colors relative group cursor-pointer"
              >
                Iniciar Sesión
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
