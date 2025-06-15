'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';
import LoadingScreen from '../ui/LoadingScreen';
import Navbar from './navbar/Navbar';
import './styles.css'; // We'll create this file for the Home page styles

const Home = () => {
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const [sinPerfiles, setSinPerfiles] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showDislikeAnimation, setShowDislikeAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);
  const [isCardActive, setIsCardActive] = useState(false);
  const [showPulseEffect, setShowPulseEffect] = useState(false);

  // Motion values for swipe effects
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const cardScale = useTransform(x, [-200, -150, 0, 150, 200], [0.9, 0.95, 1, 0.95, 0.9]);
  
  // Background color effect based on swipe direction
  const cardBgColor = useTransform(
    x, 
    [-200, -100, 0, 100, 200], 
    [
      'rgba(244, 67, 54, 0.25)', // Strong dislike - red
      'rgba(244, 67, 54, 0.15)', // Light dislike
      'rgba(255, 255, 255, 0)', // Neutral
      'rgba(76, 175, 80, 0.15)', // Light like
      'rgba(76, 175, 80, 0.25)'  // Strong like - green
    ]
  );

  // Border glow effect based on swipe direction
  const cardBorderGlow = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [
      '0 0 15px rgba(244, 67, 54, 0.6)', // Strong dislike - red glow
      '0 0 10px rgba(244, 67, 54, 0.4)', // Light dislike
      '0 8px 32px rgba(31, 38, 135, 0.2)', // Neutral
      '0 0 10px rgba(76, 175, 80, 0.4)', // Light like
      '0 0 15px rgba(76, 175, 80, 0.6)' // Strong like - green glow
    ]
  );

  // Generar posiciones de partículas una sola vez con useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

  // Generar posiciones de corazones para la animación de match
  const matchHearts = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
    }));
  }, []);

  // Generar posiciones de confeti para la animación de match
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      backgroundColor: [
        '#ff4081', '#3f51b5', '#4caf50', '#ffeb3b', '#ff9800'
      ][Math.floor(Math.random() * 5)],
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 20 + 10}px`,
      animationDelay: `${Math.random() * 1}s`,
    }));
  }, []);

  // Refs for confetti animation
  const confettiContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnimateBackground(true);
  }, []);

  useEffect(() => {
    const cargarPerfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Primero obtenemos el perfil del usuario autenticado
        const resMiPerfil = await fetch('http://localhost:8000/api/perfiles/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const miPerfil = await resMiPerfil.json();
        const id = miPerfil.datos.id;
        const idUser = miPerfil.datos.usuarioId;
        setIdUsuarioActual(idUser);

        // Luego obtenemos sugerencias con ese ID
        const resSugerencias = await fetch(`http://localhost:8000/sugerencias/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sugerencias = await resSugerencias.json();

        if (Array.isArray(sugerencias) && sugerencias.length > 0) {
          setPerfiles(sugerencias);
        } else {
          setSinPerfiles(true);
        }
      } catch (error) {
        console.error('Error cargando perfiles:', error);
        setSinPerfiles(true);
      } finally {
        setCargando(false);
      }
    };

    if (autenticado && perfilCreado) {
      cargarPerfiles();
    }
  }, [autenticado, perfilCreado]);

  // Reset motion values when profile changes
  useEffect(() => {
    animate(x, 0, { duration: 0.2 });
  }, [indice, x]);

  if (autenticado === null || perfilCreado === null || cargando) {
    return <LoadingScreen />;
  }

  if (autenticado === false || perfilCreado === false) {
    return null;
  }

  const siguientePerfil = () => {
    if (indice < perfiles.length - 1) {
      setIndice(indice + 1);
      setCurrentImageIndex(0);
    } else {
      setSinPerfiles(true);
    }
  };

  const manejarLike = async () => {
    if (!idUsuarioActual) {
      alert('No se pudo obtener tu usuario.');
      return;
    }
    
    setShowLikeAnimation(true);
    setSwipeDirection('right');
    
    const usuarioDestinoId = perfiles[indice].usuarioId;
    if (!usuarioDestinoId) {
      alert('No se pudo obtener el usuario destino.');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_origen: idUsuarioActual,
          usuario_destino: usuarioDestinoId,
          booleanLike: true,
        }),
      });
      
      const data = await response.json();
      
      // Check if it's a match
      if (data && data.match) {
        setMatchedUser(perfiles[indice].nombre);
        setShowMatchAnimation(true);
        
        // Delay to show match animation before moving to next profile
        setTimeout(() => {
          setShowMatchAnimation(false);
          setShowLikeAnimation(false);
          setSwipeDirection(null);
          siguientePerfil();
        }, 3000);
      } else {
        // Delay to show animation
        setTimeout(() => {
          setShowLikeAnimation(false);
          setSwipeDirection(null);
          siguientePerfil();
        }, 600);
      }
    } catch (error) {
      console.error('Error enviando like:', error);
      setShowLikeAnimation(false);
      setSwipeDirection(null);
      siguientePerfil();
    }
  };

  const manejarDislike = async () => {
    if (!idUsuarioActual) {
      alert('No se pudo obtener tu usuario.');
      return;
    }
    
    setShowDislikeAnimation(true);
    setSwipeDirection('left');
    
    const usuarioDestinoId = perfiles[indice].usuarioId;
    if (!usuarioDestinoId) {
      alert('No se pudo obtener el usuario destino.');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_origen: idUsuarioActual,
          usuario_destino: usuarioDestinoId,
          booleanLike: false,
        }),
      });
      
      // Delay to show animation
      setTimeout(() => {
        setShowDislikeAnimation(false);
        setSwipeDirection(null);
        siguientePerfil();
      }, 600);
    } catch (error) {
      console.error('Error enviando dislike:', error);
      setShowDislikeAnimation(false);
      setSwipeDirection(null);
      siguientePerfil();
    }
  };

  const handleNextImage = () => {
    if (perfiles[indice]?.fotos && currentImageIndex < perfiles[indice].fotos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      manejarLike();
    } else if (info.offset.x < -100) {
      manejarDislike();
    }
  };

  const handleDragStart = () => {
    setIsCardActive(true);
  };

  // Trigger pulse effect when card is tapped/clicked
  const handleCardTap = () => {
    setShowPulseEffect(true);
    setTimeout(() => setShowPulseEffect(false), 300);
  };

  return (
    <div className={`home-container ${animateBackground ? 'animate-gradient' : ''}`}>
      <Navbar />
      
      {/* Elementos de brillo en el fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
        <div className="glow-3"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((style, i) => (
          <div 
            key={i}
            className="particle"
            style={style}
          ></div>
        ))}
      </div>

      {/* Match animation overlay */}
      {showMatchAnimation && (
        <div className="match-overlay">
          <div className="match-content">
            <h2>¡Es un Match!</h2>
            <p>Tú y {matchedUser} se han gustado mutuamente</p>
            <div className="match-hearts">
              {matchHearts.map((style, i) => (
                <div 
                  key={i} 
                  className="match-heart"
                  style={style}
                >❤️</div>
              ))}
            </div>
            <div className="match-confetti" ref={confettiContainer}>
              {confettiPieces.map((style, i) => (
                <div 
                  key={i} 
                  className="confetti-piece"
                  style={style}
                ></div>
              ))}
            </div>
            <button 
              className="match-button"
              onClick={() => {
                setShowMatchAnimation(false);
                setShowLikeAnimation(false);
                setSwipeDirection(null);
                siguientePerfil();
              }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      <div className="profile-container">
        {sinPerfiles || perfiles.length === 0 ? (
          <div className="no-profiles-message">
            <div className="message-content">
              <div className="message-icon">🥲</div>
              <h2>No hay más perfiles por ahora</h2>
              <p>¡Vuelve más tarde para descubrir nuevas conexiones!</p>
            </div>
          </div>
        ) : (
          <div className="card-stack-container">
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={indice}
                className={`profile-card ${showPulseEffect ? 'pulse-effect' : ''} ${isCardActive ? 'active' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                  rotate: swipeDirection === 'left' ? -10 : swipeDirection === 'right' ? 10 : 0
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0.8,
                  x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                  position: 'absolute'
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                dragElastic={0.9}
                whileTap={{ scale: 0.98 }}
                onTap={handleCardTap}
                style={{ 
                  x, 
                  rotate,
                  scale: cardScale,
                  background: cardBgColor,
                  boxShadow: cardBorderGlow
                }}
              >
                {/* Overlay de Like/Dislike */}
                {showLikeAnimation && (
                  <div className="like-overlay">
                    <div className="like-stamp">¡ME GUSTA!</div>
                  </div>
                )}
                
                {showDislikeAnimation && (
                  <div className="dislike-overlay">
                    <div className="dislike-stamp">PASO</div>
                  </div>
                )}

                {/* Dynamic swipe indicators */}
                <motion.div 
                  className="swipe-indicator like-indicator"
                  style={{ opacity: likeOpacity }}
                >
                  <div className="indicator-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>ME GUSTA</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="swipe-indicator dislike-indicator"
                  style={{ opacity: dislikeOpacity }}
                >
                  <div className="indicator-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>PASO</span>
                  </div>
                </motion.div>

                {/* Carrusel de imágenes */}
                <div className="image-carousel">
                  {perfiles[indice]?.fotos && perfiles[indice].fotos.length > 0 ? (
                    <>
                      <img 
                        src={`http://localhost:8000/fotos/mostrar/${perfiles[indice].fotos[currentImageIndex].id}`}
                        alt={perfiles[indice].nombre}
                        className="profile-image"
                        draggable="false"
                      />
                      
                      {/* Indicadores de imagen */}
                      <div className="image-indicators">
                        {perfiles[indice].fotos.map((_: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                      
                      {/* Controles de navegación */}
                      {perfiles[indice].fotos.length > 1 && (
                        <>
                          <button 
                            className="nav-button prev" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevImage();
                            }}
                            disabled={currentImageIndex === 0}
                          >
                            ‹
                          </button>
                          <button 
                            className="nav-button next" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextImage();
                            }}
                            disabled={currentImageIndex === perfiles[indice].fotos.length - 1}
                          >
                            ›
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="no-image">No hay imagen disponible</div>
                  )}
                </div>
                
                {/* Información del perfil */}
                <div className="profile-info">
                  <h2>{perfiles[indice].nombre}, {perfiles[indice].edad}</h2>
                  <p className="location">{perfiles[indice].ubicacion}</p>
                  
                  {perfiles[indice].hobbies && perfiles[indice].hobbies.length > 0 && (
                    <div className="hobbies">
                      {perfiles[indice].hobbies.map((hobby: string, idx: number) => (
                        <span key={idx} className="hobby-tag">{hobby}</span>
                      ))}
                    </div>
                  )}
                  
                  <p className="bio">{perfiles[indice].biografia}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        
        {/* Controles de acción */}
        {!sinPerfiles && perfiles.length > 0 && (
          <div className="action-buttons">
            <button 
              className="action-button dislike"
              onClick={manejarDislike}
              aria-label="Dislike"
            >
              <div className="button-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </button>
            <button 
              className="action-button like"
              onClick={manejarLike}
              aria-label="Like"
            >
              <div className="button-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
