'use client';

import React, { useState, useEffect, useRef } from 'react';
import LoadingScreen from '@/app/ui/LoadingScreen';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';
import styles from '../crear/crearPerfil.module.css';
import hobbiesData from '../hobbies.json';
import citiesData from '../cities.json';
import '../crear/styles.css';
import Navbar from '@/app/home/navbar/Navbar';

export default function EditarPerfil() {
  const [perfil, setPerfil] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editado, setEditado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [vistaPrevia, setVistaPrevia] = useState<string[]>([]);
  const [fotoPortadaIndex, setFotoPortadaIndex] = useState<number | null>(null);
  const router = useRouter();
  const autenticado = useAuthGuard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para la interfaz y animaciones
  const [mostrarPopupHobbies, setMostrarPopupHobbies] = useState(false);
  const [hobbiesSeleccionados, setHobbiesSeleccionados] = useState<string[]>([]);
  const [contadorHobbies, setContadorHobbies] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Estados para el buscador de ciudades
  const [ciudadBusqueda, setCiudadBusqueda] = useState('');
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<string[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MAX_HOBBIES = hobbiesData.maxHobbies;
  const opcionesHobbies = hobbiesData.hobbies;

  // Efecto para animar la tarjeta al cargar
  useEffect(() => {
    setAnimateCard(true);
    setAnimateBackground(true);
  }, []);

  // Efecto para filtrar ciudades basado en la búsqueda
  useEffect(() => {
    if (ciudadBusqueda.trim() === '') {
      setCiudadesFiltradas([]);
    } else {
      const filtradas = citiesData.filter(city => 
        city.toLowerCase().includes(ciudadBusqueda.toLowerCase())
      ).slice(0, 50); // Limitamos a 50 resultados para mejor rendimiento
      setCiudadesFiltradas(filtradas);
    }
  }, [ciudadBusqueda]);

  // Efecto para resetear el índice seleccionado cuando cambian las ciudades filtradas
  useEffect(() => {
    setSelectedIndex(-1);
  }, [ciudadesFiltradas]);

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (fotos.length > 0) {
      const previews = fotos.map((foto) => URL.createObjectURL(foto));
      setVistaPrevia(previews);
    }
  }, [fotos]);

  useEffect(() => {
    if (autenticado === false) {
      router.push('/login');
    }
  }, [autenticado, router]);

  // Efecto para resetear la animación de confeti
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/perfiles/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.datos) {
        setPerfil(data.datos);
        setForm(data.datos);
        
        // Inicializar la búsqueda de ciudad con la ubicación actual
        if (data.datos.ubicacion) {
          setCiudadBusqueda(data.datos.ubicacion);
        }

        if (data.datos.hobbies && Array.isArray(data.datos.hobbies)) {
          setHobbiesSeleccionados(data.datos.hobbies);
          setContadorHobbies(data.datos.hobbies.length);
        }
      }
    };

    if (autenticado) {
      cargarPerfil();
    }
  }, [autenticado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setEditado(true);
  };

  const manejarCambioFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
      setEditado(true);
    }
  };

  const abrirSelectorFotos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleHobby = (hobby: string) => {
    if (hobbiesSeleccionados.includes(hobby)) {
      setHobbiesSeleccionados(hobbiesSeleccionados.filter((h) => h !== hobby));
      setContadorHobbies((prev) => prev - 1);
    } else if (contadorHobbies < MAX_HOBBIES) {
      setHobbiesSeleccionados([...hobbiesSeleccionados, hobby]);
      setContadorHobbies((prev) => prev + 1);
    }
    setEditado(true);
  };

  const guardarHobbies = () => {
    setForm((prev: any) => ({
      ...prev,
      hobbies: hobbiesSeleccionados,
    }));
    setMostrarPopupHobbies(false);
    setEditado(true);
  };
  
  // Manejador para la navegación con teclado en el dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarDropdown || ciudadesFiltradas.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < ciudadesFiltradas.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : ciudadesFiltradas.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          seleccionarCiudad(ciudadesFiltradas[selectedIndex]);
        }
        break;
      case 'Escape':
        setMostrarDropdown(false);
        break;
      default:
        break;
    }
  };
  
  const seleccionarCiudad = (ciudad: string) => {
    setForm((prev: any) => ({ ...prev, ubicacion: ciudad }));
    setCiudadBusqueda(ciudad);
    setMostrarDropdown(false);
    setEditado(true);
  };

  const manejarBlurUbicacion = () => {
    // Pequeño retraso para permitir que el clic en las opciones se procese primero
    setTimeout(() => {
      if (ciudadBusqueda && ciudadBusqueda.trim() !== '' && !mostrarDropdown) {
        // Si el usuario escribió algo y no está en el dropdown, usamos ese valor
        setForm((prev: any) => ({ ...prev, ubicacion: ciudadBusqueda }));
      }
    }, 200);
  };

  const guardarCambios = async () => {
    setIsLoading(true);
    setButtonClicked(true);
    
    const token = localStorage.getItem('token');
    if (!token || !perfil?.id) return;

    // Actualizar datos del perfil
    const formData = {
      ...form,
      hobbies: hobbiesSeleccionados,
    };

    const res = await fetch(`http://localhost:8000/api/perfiles/${perfil.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      // Primero borrar todas las fotos anteriores del perfil
      const borrarFotosRes = await fetch(`http://localhost:8000/fotos/borrarFotos/${perfil.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!borrarFotosRes.ok) {
        setMensaje('Error al borrar fotos anteriores');
        setIsLoading(false);
        return;
      }

      // Luego subir las nuevas fotos
      if (fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          const data = new FormData();
          data.append('perfil_id', perfil.id.toString());
          data.append('foto_portada', i === fotoPortadaIndex ? '1' : '0');
          data.append('imagen', fotos[i]);

          await fetch('http://localhost:8000/fotos/upload', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: data,
          });
        }
      }

      // Mostrar animación de confeti
      setShowConfetti(true);
      setMensaje('Perfil actualizado correctamente ✅');
      setEditado(false);
      
      // Esperar un momento para mostrar la animación
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    } else {
      const error = await res.json();
      setMensaje(`Error: ${error.error || 'No se pudo actualizar el perfil'}`);
      setIsLoading(false);
      setButtonClicked(false);
    }
  };

  if (autenticado === null || !perfil) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <main className={`min-h-screen pt-24 bg-gradient-to-br from-violet-950 via-indigo-900 to-fuchsia-900 p-6 overflow-hidden relative ${animateBackground ? 'animate-gradient' : ''}`}>
        {/* Elementos de brillo en el fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
          <div className="glow-3"></div>
        </div>
        
        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            ></div>
          ))}
        </div>
        
        {/* Animación de confeti */}
        {showConfetti && (
          <div className="confetti-container">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i} 
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 20}%`,
                  backgroundColor: [
                    '#8b5cf6', // Morado
                    '#60a5fa', // Azul
                    '#a78bfa', // Lavanda
                    '#93c5fd', // Azul claro
                    '#f472b6', // Rosa
                    '#4ade80', // Verde
                  ][Math.floor(Math.random() * 6)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`,
                  transform: `translateX(${(Math.random() * 2 - 1) * 20}vw)`,
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Tarjeta principal del formulario */}
        <div className={`w-full max-w-4xl mx-auto bg-gradient-to-br from-indigo-800/90 to-violet-600/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-violet-300/30 transition-all duration-500 hover:shadow-violet-400/60 relative z-10 shadow-[0_0_35px_rgba(139,92,246,0.5)] ${animateCard ? 'fade-in' : ''} ${buttonClicked ? 'animate-card-success' : ''}`}>
          {/* Efecto de brillo que recorre la tarjeta */}
          <div className="card-shine"></div>
          {/* Resplandor pulsante alrededor de la tarjeta */}
          <div className="card-glow"></div>
          
          {/* Encabezado */}
          <div className="px-8 pt-10 pb-8 text-center bg-gradient-to-b from-violet-900/40 to-transparent">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-400 flex items-center justify-center shadow-lg shadow-violet-500/50 rotate-12 hover:rotate-0 transition-all duration-300">
                <span className="text-white text-3xl font-bold">SS</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent animate-shimmer">
              Editar Tu Perfil
            </h1>
            <p className="text-white/80 mt-3 font-medium max-w-lg mx-auto">
              Actualiza tu información y mantén tu perfil al día
            </p>
          </div>
          
          {/* Formulario */}
          <div className="p-8">
            {mensaje && (
              <div className={`mb-6 p-4 rounded-xl text-center ${mensaje.includes('Error') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                <div className="flex items-center justify-center gap-2">
                  {mensaje.includes('Error') ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{mensaje}</span>
                </div>
              </div>
            )}
            
            {/* Sección de información básica */}
            <div className="form-section slide-in bg-gradient-to-br from-indigo-900/40 to-violet-800/30 border border-violet-500/20 rounded-xl p-6">
              <h2 className="section-title flex items-center space-x-2 text-fuchsia-300 mb-4 pb-2 border-b border-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Información básica</span>
              </h2>
              
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label" htmlFor="nombre">Nombre</label>
                  <input 
                    id="nombre"
                    name="nombre" 
                    className="form-input bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                    placeholder="Tu nombre" 
                    value={form.nombre || ''}
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="form-col">
                  <label className="form-label" htmlFor="edad">Edad</label>
                  <input 
                    id="edad"
                    type="number" 
                    name="edad" 
                    className="form-input bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                    placeholder="Tu edad" 
                    min="18" 
                    max="100" 
                    value={form.edad || ''}
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label" htmlFor="genero">Género</label>
                  <select 
                    id="genero"
                    name="genero" 
                    className="form-select bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                    value={form.genero || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                  </select>
                </div>
                
                <div className="form-col">
                  <label className="form-label" htmlFor="ubicacion">Ubicación</label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input 
                      id="ubicacion"
                      name="ubicacion" 
                      className="form-input pl-10 bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                      placeholder="Busca tu ciudad" 
                      value={ciudadBusqueda}
                      onChange={(e) => {
                        setCiudadBusqueda(e.target.value);
                        setMostrarDropdown(true);
                      }}
                      onFocus={() => setMostrarDropdown(true)}
                      onBlur={manejarBlurUbicacion}
                      onKeyDown={handleKeyDown}
                      aria-expanded={mostrarDropdown}
                      aria-autocomplete="list"
                      aria-controls="ciudad-listbox"
                      role="combobox"
                    />
                    {ciudadBusqueda && (
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => {
                          setCiudadBusqueda('');
                          setForm((prev: any) => ({ ...prev, ubicacion: '' }));
                          setEditado(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    {mostrarDropdown && ciudadBusqueda && (
                      <div 
                        className="city-dropdown" 
                        id="ciudad-listbox"
                        role="listbox"
                      >
                        {ciudadesFiltradas.length > 0 ? (
                          ciudadesFiltradas.map((ciudad, index) => (
                            <div 
                              key={index} 
                              className={`city-option ${index === selectedIndex ? 'active' : ''}`}
                              onClick={() => seleccionarCiudad(ciudad)}
                              role="option"
                              aria-selected={index === selectedIndex}
                              id={`ciudad-option-${index}`}
                            >
                              {ciudad}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center">
                            <div className="city-option text-gray-500">
                              No se encontraron resultados
                            </div>
                            <button
                              type="button"
                              className="mt-2 w-full py-2 px-3 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 rounded-md transition-colors"
                              onClick={() => {
                                seleccionarCiudad(ciudadBusqueda);
                              }}
                            >
                              Usar "{ciudadBusqueda}"
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="biografia">Biografía</label>
                <textarea 
                  id="biografia"
                  name="biografia" 
                  className="form-textarea bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                  placeholder="Cuéntanos sobre ti..." 
                  value={form.biografia || ''}
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            {/* Sección de preferencias */}
            <div className="form-section slide-in bg-gradient-to-br from-indigo-900/40 to-violet-800/30 border border-violet-500/20 rounded-xl p-6" style={{ animationDelay: '0.1s' }}>
              <h2 className="section-title flex items-center space-x-2 text-fuchsia-300 mb-4 pb-2 border-b border-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>Preferencias</span>
              </h2>
              
              <div className="form-group">
                <label className="form-label" htmlFor="preferenciaSexual">Preferencia sexual</label>
                <select 
                  id="preferenciaSexual"
                  name="preferenciaSexual" 
                  className="form-select bg-indigo-900/30 border-violet-500/30 focus:border-fuchsia-400 focus:ring focus:ring-fuchsia-400/20" 
                  value={form.preferenciaSexual || ''}
                  onChange={handleChange}
                >
                  <option value="">Selecciona tu preferencia</option>
                  <option value="hombres">Hombres</option>
                  <option value="mujeres">Mujeres</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Rango de edad que te interesa</label>
                
                <div className="range-container">
                  <div className="range-values">
                    <span>{form.rangoEdadMin || 18} años</span>
                    <span>{form.rangoEdadMax || 35} años</span>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-col">
                      <label className="form-label" htmlFor="rangoEdadMin">Edad mínima</label>
                      <input 
                        id="rangoEdadMin"
                        type="range" 
                        name="rangoEdadMin"
                        className="range-slider" 
                        min="18" 
                        max="100" 
                        value={form.rangoEdadMin || 18}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="form-col">
                      <label className="form-label" htmlFor="rangoEdadMax">Edad máxima</label>
                      <input 
                        id="rangoEdadMax"
                        type="range" 
                        name="rangoEdadMax"
                        className="range-slider" 
                        min={form.rangoEdadMin || 18} 
                        max="100" 
                        value={form.rangoEdadMax || 35}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de fotos */}
            <div className="form-section slide-in bg-gradient-to-br from-indigo-900/40 to-violet-800/30 border border-violet-500/20 rounded-xl p-6" style={{ animationDelay: '0.2s' }}>
              <h2 className="section-title flex items-center space-x-2 text-fuchsia-300 mb-4 pb-2 border-b border-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>Tus mejores fotos</span>
              </h2>
              
              <div className="photos-section">
                <div className="photo-upload" onClick={abrirSelectorFotos}>
                  <div className="upload-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="upload-text">Arrastra tus fotos aquí o haz clic para seleccionarlas</p>
                  <div className="upload-button">
                    <span>Seleccionar fotos</span>
                    <span className="ml-2">✨</span>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="photo-input"
                    onChange={manejarCambioFotos} 
                  />
                </div>
                
                {vistaPrevia.length > 0 && (
                  <div className="photo-gallery">
                    {vistaPrevia.map((url, index) => (
                      <div key={index} className={`photo-item ${fotoPortadaIndex === index ? 'border-blue-400' : ''}`}>
                        <img src={url} alt={`Foto ${index + 1}`} />
                        
                        {fotoPortadaIndex === index && (
                          <div className="cover-badge">Portada</div>
                        )}
                        
                        <div className="photo-actions">
                          <input 
                            type="radio"
                            id={`foto-${index}`}
                            name="fotoPortada"
                            className="photo-radio"
                            checked={fotoPortadaIndex === index}
                            onChange={() => setFotoPortadaIndex(index)}
                          />
                          <label htmlFor={`foto-${index}`} className="photo-radio-label">
                            <span className="photo-radio-custom"></span>
                            Portada
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sección de intereses */}
            <div className="form-section slide-in bg-gradient-to-br from-indigo-900/40 to-violet-800/30 border border-violet-500/20 rounded-xl p-6" style={{ animationDelay: '0.3s' }}>
              <h2 className="section-title flex items-center space-x-2 text-fuchsia-300 mb-4 pb-2 border-b border-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Intereses</span>
              </h2>
              
              <div className="interests-section">
                <button 
                  type="button" 
                  className="interests-button"
                  onClick={() => setMostrarPopupHobbies(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Añadir intereses ({hobbiesSeleccionados.length}/{MAX_HOBBIES})
                </button>
                
                {hobbiesSeleccionados.length > 0 && (
                  <div className="interests-tags">
                    {hobbiesSeleccionados.map(hobby => (
                      <span key={hobby} className="interest-tag">
                        {hobby}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Mensaje de error */}
            {mensaje && mensaje.includes('Error') && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {mensaje}
              </div>
            )}
            
            {/* Botón de envío */}
            <div className="submit-container">
              <button 
                type="button" 
                className="submit-button relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-violet-700 hover:from-fuchsia-500 hover:to-violet-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-violet-700/30 transition-all duration-300 transform hover:-translate-y-1"
                onClick={guardarCambios}
                disabled={isLoading || !editado}
              >
                <span className={`relative z-10 flex justify-center items-center ${buttonClicked && !isLoading ? 'animate-text-disappear' : ''}`}>
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Actualizando perfil...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </span>
                
                {/* Efectos de hover para el botón */}
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="absolute -inset-1 scale-x-0 group-hover:scale-x-100 bg-gradient-to-r from-fuchsia-400/20 to-violet-400/20 origin-left transition-transform duration-500 rounded-xl blur-xl"></span>
                
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
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal de intereses */}
      {mostrarPopupHobbies && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">¿Cuál es tu rollo?</h3>
              <button 
                type="button" 
                className="modal-close"
                onClick={() => setMostrarPopupHobbies(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-subtitle">Para gustos, colores. ¡Cuéntanos lo que te va a ti!</p>
              
              <div className="interests-counter">
                Has seleccionado {contadorHobbies} de {MAX_HOBBIES} intereses
              </div>
              
              <div className="interests-grid">
                {opcionesHobbies.map(hobby => (
                  <button
                    key={hobby}
                    type="button"
                    className={`interest-option ${hobbiesSeleccionados.includes(hobby) ? 'selected' : ''}`}
                    onClick={() => toggleHobby(hobby)}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="save-button"
                onClick={guardarHobbies}
              >
                Guardar intereses
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
