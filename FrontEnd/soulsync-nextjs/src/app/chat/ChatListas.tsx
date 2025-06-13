"use client";


import React, { useState, useEffect, useRef } from 'react';
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
  const [ultimoMensajeId, setUltimoMensajeId] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalEncuentrosRef = useRef<NodeJS.Timeout | null>(null);
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
    }, 10000);

    // Limpiar el intervalo cuando cambie el encuentro activo o al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [encuentroActivo, usuarioId]);

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
          msg.remitente_id !== usuarioId && msg.id > ultimoMensajeId
        );

        // Si hay mensajes nuevos del otro usuario, actualizar la lista completa
        if (mensajesNuevos.length > 0) {
          console.log('Se encontraron nuevos mensajes del otro usuario, actualizando chat');
          
          // Actualizar el último ID de mensaje
          const maxId = Math.max(...mensajesData.map(msg => msg.id));
          setUltimoMensajeId(maxId);
          
          // Transformar formato de mensajes del API al formato de la UI
          const mensajesFormateados = mensajesData.map(msg => ({
            id: msg.id,
            texto: msg.contenido,
            emisor: msg.remitente_id === usuarioId ? "yo" : "otro"
          }));
         
          setMensajes(mensajesFormateados);
        }
      }
    } catch (error) {
      console.error('Error verificando mensajes nuevos:', error);
    }
  };

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
        // Encontrar el ID de mensaje más alto para el seguimiento
        if (mensajesData.length > 0) {
          const maxId = Math.max(...mensajesData.map(msg => msg.id));
          setUltimoMensajeId(maxId);
        }

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
      emisor: "yo",
    };


    setMensajes(prev => [...prev, nuevoMensajeObj]);
    const textoMensaje = nuevoMensaje;
    setNuevoMensaje("");


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

    intervalEncuentrosRef.current = setInterval(verificarNuevosEncuentros, 10000);
    return () => {
      if (intervalEncuentrosRef.current) {
        clearInterval(intervalEncuentrosRef.current);
      }
    };
  }, [usuarioId, perfiles, chatActivo]);

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
