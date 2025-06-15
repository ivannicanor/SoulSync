"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';
import LoadingScreen from '../ui/LoadingScreen';

// Mensajes de ejemplo para cada chat
const ChatVista: React.FC = () => {
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const [sinPerfiles, setSinPerfiles] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [chatActivo, setChatActivo] = useState("");
  const [mensajes, setMensajes] = useState<{ id: number; texto: string; emisor: string; timestamp?: string }[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [encuentroActivo, setEncuentroActivo] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [ultimoMensajeId, setUltimoMensajeId] = useState<number>(0);
  const [animateBackground, setAnimateBackground] = useState(false);
  const [showSendAnimation, setShowSendAnimation] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalEncuentrosRef = useRef<NodeJS.Timeout | null>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  
  // Generar posiciones de partículas una sola vez con useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

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
        const id = miPerfil.datos.usuarioId;
        setUsuarioId(id);

        // Obtener todas las notificaciones del usuario
        const resNotificaciones = await fetch(`http://localhost:8000/notificaciones/usuario/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const notificaciones = await resNotificaciones.json();
        
        // Marcar cada notificación no leída como leída
        for (const notificacion of notificaciones) {
          if (!notificacion.leido) {
            await fetch(`http://localhost:8000/notificaciones/${notificacion.id}/leida`, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        }

        // Luego obtenemos los matches con ese ID
        const resUsuarios = await fetch(`http://localhost:8000/encuentros/usuarioMatch/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
         
        const matches = await resUsuarios.json();

        if (Array.isArray(matches) && matches.length > 0) {
          setPerfiles(matches);
          // Actualizar el chat activo al primer match
          const primerMatch = matches[0].con_nombre || "Chat";
          setChatActivo(primerMatch);
          setEncuentroActivo(matches[0].encuentro_id);
          cargarMensajes(matches[0].encuentro_id);
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

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autenticado, perfilCreado]);

  // Efecto para manejar el polling de mensajes nuevos
  useEffect(() => {
    if (encuentroActivo === null || !usuarioId) return;

    // Iniciar el intervalo para verificar mensajes nuevos
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Establecer un intervalo para verificar mensajes cada 10 segundos
    intervalRef.current = setInterval(() => {
      verificarNuevosMensajes(encuentroActivo);
    }, 5000);

    // Limpiar el intervalo cuando cambie el encuentro activo o al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [encuentroActivo, usuarioId]);

  // Scroll al último mensaje cuando se añaden nuevos mensajes
  useEffect(() => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  // Función para verificar si hay mensajes nuevos sin mostrar carga
  const verificarNuevosMensajes = async (encuentroId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const resMensajes = await fetch(`http://localhost:8000/mensajes/encuentro/${encuentroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mensajesData = await resMensajes.json();
     
      if (Array.isArray(mensajesData) && mensajesData.length > 0) {
        // Buscar si hay mensajes nuevos del otro usuario
        const mensajesNuevos = mensajesData.filter(msg => 
          String(msg.remitente_id) !== (usuarioId ? String(usuarioId) : localStorage.getItem('usuarioId') || '') && msg.id > ultimoMensajeId
        );

        // Si hay mensajes nuevos del otro usuario, actualizar la lista completa
        if (mensajesNuevos.length > 0) {
          // Actualizar el último ID de mensaje
          const maxId = Math.max(...mensajesData.map(msg => msg.id));
          setUltimoMensajeId(maxId);
          
          // Obtener el perfil activo para verificar el ID del remitente
          const perfilActivo = perfiles.find(p => p.encuentro_id === encuentroId);
          const otroUsuarioId = perfilActivo ? perfilActivo.con_usuario_id : null;
          
          // Transformar formato de mensajes del API al formato de la UI
          const mensajesFormateados = mensajesData.map(msg => {
            // Asegurarse de que el ID del usuario actual está disponible
            const idUsuario = usuarioId ? String(usuarioId) : localStorage.getItem('usuarioId') || '';
            
            return {
              id: msg.id,
              texto: msg.contenido,
              emisor: String(msg.remitente_id) === idUsuario ? "yo" : "otro"
              // Se elimina el timestamp
            };
          });
         
          setMensajes(mensajesFormateados);
        }
      }
    } catch (error) {
      console.error('Error verificando mensajes nuevos:', error);
    }
  };

  // Función para formatear la fecha (mantenida por si se necesita en el futuro)
// const formatTimestamp = (timestamp: string) => {
//   if (!timestamp) return '';
//   
//   const date = new Date(timestamp);
//   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// };

  // Función para cargar mensajes de un encuentro
  const cargarMensajes = async (encuentroId: number) => {
    setCargandoMensajes(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Primero obtenemos el ID del usuario actual si no lo tenemos
      if (!usuarioId) {
        const resMiPerfil = await fetch('http://localhost:8000/api/perfiles/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const miPerfil = await resMiPerfil.json();
        const id = miPerfil.datos.usuarioId;
        setUsuarioId(id);
      }

      const resMensajes = await fetch(`http://localhost:8000/mensajes/encuentro/${encuentroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mensajesData = await resMensajes.json();
     
      if (Array.isArray(mensajesData)) {
        // Encontrar el ID de mensaje más alto para el seguimiento
        if (mensajesData.length > 0) {
          const maxId = Math.max(...mensajesData.map(msg => msg.id));
          setUltimoMensajeId(maxId);
        }

        // Transformar formato de mensajes del API al formato de la UI
        const mensajesFormateados = mensajesData.map(msg => {
          // Asegurarse de que el ID del usuario actual está disponible
          const idUsuario = usuarioId ? String(usuarioId) : localStorage.getItem('usuarioId') || '';
          
          return {
            id: msg.id,
            texto: msg.contenido,
            // Si el remitente_id es el mismo que el usuario actual, es "yo", si no es "otro"
            emisor: String(msg.remitente_id) === idUsuario ? "yo" : "otro"
            // Se elimina el timestamp
          };
        });
       
        setMensajes(mensajesFormateados);
      } else {
        setMensajes([]);
        setUltimoMensajeId(0);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setMensajes([]);
    } finally {
      setCargandoMensajes(false);
    }
  };

  const cambiarChat = (nombre: string, encuentroId: number) => {
    setChatActivo(nombre);
    setEncuentroActivo(encuentroId);
    cargarMensajes(encuentroId);
    setNuevoMensaje("");
  };

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === "" || !encuentroActivo || !usuarioId) return;

      // Primero añadimos el mensaje a la UI para feedback inmediato
  const nuevoMensajeObj = {
    id: Date.now(), // ID temporal
    texto: nuevoMensaje,
    emisor: "yo"
    // Se elimina el timestamp
  };

    setMensajes(prev => [...prev, nuevoMensajeObj]);
    const textoMensaje = nuevoMensaje;
    setNuevoMensaje("");
    
    // Mostrar animación de envío
    setShowSendAnimation(true);
    setTimeout(() => setShowSendAnimation(false), 800);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Luego enviamos al servidor
      const response = await fetch('http://localhost:8000/mensajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          encuentro_id: encuentroActivo,
          remitente_id: usuarioId,
          contenido: textoMensaje,
        }),
      });

      // Si la respuesta es exitosa, actualizamos el último ID de mensaje
      if (response.ok) {
        const mensajeCreado = await response.json();
        if (mensajeCreado && mensajeCreado.id) {
          setUltimoMensajeId(Math.max(ultimoMensajeId, mensajeCreado.id));
        }
        // Recargar los mensajes para tener los IDs correctos
        cargarMensajes(encuentroActivo);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  // Polling para nuevos encuentros
  useEffect(() => {
    if (!usuarioId) return;

    // Limpiar cualquier intervalo anterior
    if (intervalEncuentrosRef.current) {
      clearInterval(intervalEncuentrosRef.current);
    }

    // Función para verificar nuevos encuentros
    const verificarNuevosEncuentros = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resUsuarios = await fetch(`http://localhost:8000/encuentros/usuarioMatch/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const matches = await resUsuarios.json();
        if (Array.isArray(matches)) {
          // Solo actualiza si hay cambios en la lista de encuentros
          const idsActuales = perfiles.map(p => p.encuentro_id).sort().join(',');
          const idsNuevos = matches.map(p => p.encuentro_id).sort().join(',');
          if (idsActuales !== idsNuevos) {
            setPerfiles(matches);
            // Si el chat activo ya no existe, selecciona el primero
            const existeActivo = matches.some(m => m.con_nombre === chatActivo);
            if (!existeActivo && matches.length > 0) {
              setChatActivo(matches[0].con_nombre);
              setEncuentroActivo(matches[0].encuentro_id);
              cargarMensajes(matches[0].encuentro_id);
            }
          }
        }
      } catch (error) {
        // No hacer nada
      }
    };

    intervalEncuentrosRef.current = setInterval(verificarNuevosEncuentros, 5000);
    return () => {
      if (intervalEncuentrosRef.current) {
        clearInterval(intervalEncuentrosRef.current);
      }
    };
  }, [usuarioId, perfiles, chatActivo]);

  // Manejar envío al presionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // Efecto para obtener el ID del usuario y guardarlo en localStorage
  useEffect(() => {
    const obtenerIdUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const resMiPerfil = await fetch('http://localhost:8000/api/perfiles/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const miPerfil = await resMiPerfil.json();
        const id = miPerfil.datos.usuarioId;
        setUsuarioId(id);
        localStorage.setItem('usuarioId', id.toString());
      } catch (error) {
        console.error('Error obteniendo ID de usuario:', error);
      }
    };
    
    if (autenticado && perfilCreado) {
      obtenerIdUsuario();
    }
  }, [autenticado, perfilCreado]);

  if (autenticado === null || perfilCreado === null || cargando) {
    return <LoadingScreen />;
  }

  if (autenticado === false || perfilCreado === false) {
    return null;
  }

  return (
    <div className="chat-container">
      {/* MENÚ LATERAL */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Mensajes</h2>
        </div>
        
        <div className="chat-sidebar-content">
          {cargando ? (
            <div className="chat-loading-state">
              <div className="chat-loading-spinner"></div>
              <span>Cargando conversaciones...</span>
            </div>
          ) : sinPerfiles ? (
            <div className="no-chats-message">
              <div className="no-chats-icon">💬</div>
              <h3>No hay conversaciones</h3>
              <p>¡Haz match con nuevas personas para comenzar a chatear!</p>
            </div>
          ) : (
            <div className="chat-list">
              <AnimatePresence>
                {perfiles.map((perfil) => (
                  <motion.div
                    key={perfil.con_usuario_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => cambiarChat(perfil.con_nombre, perfil.encuentro_id)}
                    className={`chat-list-item ${
                      perfil.con_nombre === chatActivo ? 'active' : ''
                    }`}
                  >
                    <div className="chat-avatar">
                      <div className="avatar-placeholder">
                        {perfil.con_nombre.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">{perfil.con_nombre}</div>
                      <div className="chat-last-message">
                        {/* Mostrar el último mensaje si existe */}
                        {perfil.ultimo_mensaje || "Nuevo match"}
                      </div>
                    </div>
                    <div className="chat-time">
                      {/* Formatear fecha si existe */}
                      {perfil.fecha && new Date(perfil.fecha).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* VISTA DEL CHAT */}
      <div className="chat-main">
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
        
        {/* Cabecera del chat */}
        <div className="chat-header">
          <div className="chat-header-info">
            {chatActivo && (
              <>
                <div className="chat-header-avatar">
                  <div className="avatar-placeholder">
                    {chatActivo.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="chat-header-name">{chatActivo}</div>
              </>
            )}
          </div>
        </div>
        
        {/* Área de mensajes */}
        <div className="chat-messages-container">
          <div className="chat-messages">
            {cargandoMensajes ? (
              <div className="chat-loading-messages">
                <div className="chat-loading-spinner"></div>
                <span>Cargando mensajes...</span>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="chat-no-messages">
                <div className="no-messages-icon">✨</div>
                <h3>No hay mensajes</h3>
                <p>¡Envía el primer mensaje para comenzar la conversación!</p>
              </div>
            ) : (
              <>
                {mensajes.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`chat-message ${
                      msg.emisor === "yo" ? "outgoing" : "incoming"
                    }`}
                  >
                    <div className="message-content">
                      <div className="message-text">{msg.texto}</div>
                    </div>
                  </motion.div>
                ))}
                {/* Elemento invisible para hacer scroll automático */}
                <div ref={mensajesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Área de entrada de mensaje */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <textarea
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
              rows={1}
            />
            <motion.button 
              onClick={enviarMensaje} 
              className={`chat-send-button ${showSendAnimation ? 'animate-send' : ''}`}
              disabled={nuevoMensaje.trim() === ""}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Enviar mensaje"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatVista;
