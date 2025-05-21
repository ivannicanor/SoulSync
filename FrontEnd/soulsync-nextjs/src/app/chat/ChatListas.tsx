"use client";

import React, { useState, useEffect } from 'react';
import estilos from "./chat.module.css";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';

// Mensajes de ejemplo para cada chat


const ChatVista: React.FC = () => {
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const [sinPerfiles, setSinPerfiles] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [chatActivo, setChatActivo] = useState("");
  const [mensajes, setMensajes] = useState<{ id: number; texto: string; emisor: string }[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [encuentroActivo, setEncuentroActivo] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();
  
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
        console.log('ID del usuario:', id);
        setUsuarioId(id);

        // Luego obtenemos los matches con ese ID (con_nombre con la persona que tiene el match , el id del encuentro, la fecha y usuario usuario_id)
        const resUsuarios = await fetch(`http://localhost:8000/encuentros/usuarioMatch/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
         
        const matches = await resUsuarios.json();

 
        if (Array.isArray(matches) && matches.length > 0) {
          setPerfiles(matches);
          // Actualizar el chat activo al primer match
          //para obtener el nombre del match usamos .con_nombre
          //para obtener el id del encuentro usamos .encuentro_id
          //para obtener la fecha del match usamos .fecha
          //para obtener el id del otro usuario usamos .con_usuario_id
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
  }, [autenticado, perfilCreado]);

  // Función para cargar mensajes de un encuentro (obtenemos el chat de un encuentro mensajes entre las 2 personas)
  const cargarMensajes = async (encuentroId: number) => {
    setCargandoMensajes(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const resMensajes = await fetch(`http://localhost:8000/mensajes/encuentro/${encuentroId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mensajesData = await resMensajes.json();
      
      if (Array.isArray(mensajesData)) {
        // Transformar formato de mensajes del API al formato de la UI
        const mensajesFormateados = mensajesData.map(msg => ({
          id: msg.id,
          texto: msg.contenido,
          // Si el remitente_id es el mismo que el usuario actual, es "yo", si no es "otro"
          emisor: msg.remitente_id === usuarioId ? "yo" : "otro"
        }));
        
        setMensajes(mensajesFormateados);
      } else {
        setMensajes([]);
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
      emisor: "yo",
    };

    setMensajes(prev => [...prev, nuevoMensajeObj]);
    const textoMensaje = nuevoMensaje;
    setNuevoMensaje("");

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Luego enviamos al servidor
      await fetch('http://localhost:8000/mensajes', {
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

      // Opcionalmente, podríamos recargar los mensajes desde el servidor
      // para asegurarnos de tener la versión más actualizada
      // cargarMensajes(encuentroActivo);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  return (
    <div className={estilos.contenedorPrincipal}>
      {/* MENÚ LATERAL */}
      <div className={estilos.menuLateral}>
        <h4>Chats Activos</h4>
        {cargando ? (
          <div>Cargando...</div>
        ) : sinPerfiles ? (
          <div>No hay matches disponibles</div>
        ) : (
          perfiles.map((perfil) => (
            <div
              key={perfil.con_usuario_id}
              onClick={() => cambiarChat(perfil.con_nombre, perfil.encuentro_id)}
              className={`${estilos.chatItem} ${
                perfil.con_nombre === chatActivo ? estilos.chatItemActivo : ""
              }`}
            >
              {perfil.con_nombre}
            </div>
          ))
        )}
      </div>

      {/* VISTA DEL CHAT */}
      <div className={estilos.chatVista}>
        <div className={estilos.mensajes}>
          {cargandoMensajes ? (
            <div className={estilos.cargandoMensajes}>Cargando mensajes...</div>
          ) : mensajes.length === 0 ? (
            <div className={estilos.sinMensajes}>No hay mensajes. ¡Envía el primero!</div>
          ) : (
            mensajes.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.emisor === "yo"
                    ? estilos.mensajePropio
                    : estilos.mensajeOtro
                }
              >
                {msg.texto}
              </div>
            ))
          )}
        </div>

        <div className={estilos.inputContainer}>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            className={estilos.inputCampo}
          />
          <button onClick={enviarMensaje} className={estilos.botonEnviar}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatVista;
