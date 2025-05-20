"use client";

import React, { useState } from "react";
import estilos from "./chat.module.css";

// Lista de chats de ejemplo (futura conexión con backend)
const chatsDisponibles = ["Lucía", "Helena", "Itziar"];

// Mensajes de ejemplo para cada chat
const mensajesMock: Record<string, { id: number; texto: string; emisor: string }[]> = {
  "Lucía": [
    { id: 1, texto: "¡Hola Lucía! ¿Cómo estás?", emisor: "yo" },
    { id: 2, texto: "Todo bien, ¿y tú?", emisor: "otro" },
  ],
  "Helena": [
    { id: 1, texto: "Hola Helena 😊", emisor: "yo" },
  ],
  "Itziar": [
    { id: 1, texto: "¡Buenas Itziar!", emisor: "yo" },
    { id: 2, texto: "¿Cómo va todo?", emisor: "yo" },
  ],
};

const ChatVista: React.FC = () => {
  const [chatActivo, setChatActivo] = useState("Lucía");
  const [mensajes, setMensajes] = useState(mensajesMock[chatActivo]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const cambiarChat = (nombre: string) => {
    setChatActivo(nombre);
    setMensajes(mensajesMock[nombre] || []);
    setNuevoMensaje("");
  };

  const enviarMensaje = () => {
    if (nuevoMensaje.trim() === "") return;

    const nuevo = {
      id: mensajes.length + 1,
      texto: nuevoMensaje,
      emisor: "yo",
    };

    const mensajesActualizados = [...mensajes, nuevo];
    setMensajes(mensajesActualizados);
    mensajesMock[chatActivo] = mensajesActualizados;
    setNuevoMensaje("");
  };

  return (
    <div className={estilos.contenedorPrincipal}>
      {/* MENÚ LATERAL */}
      <div className={estilos.menuLateral}>
        <h4>Chats Activos</h4>
        {chatsDisponibles.map((nombre) => (
          <div
            key={nombre}
            onClick={() => cambiarChat(nombre)}
            className={`${estilos.chatItem} ${
              nombre === chatActivo ? estilos.chatItemActivo : ""
            }`}
          >
            {nombre}
          </div>
        ))}
      </div>

      {/* VISTA DEL CHAT */}
      <div className={estilos.chatVista}>
        <div className={estilos.mensajes}>
          {mensajes.map((msg) => (
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
          ))}
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
