"use client";

import React, { useEffect } from "react";
import estilos from "./estilos.module.css";

// ✅ Interfaz para definir las propiedades del componente
interface MensajeAccionProps {
  mensaje: string; // Mensaje que se muestra en pantalla
  onClose: () => void; // Función para cerrar el mensaje
}

// ✅ Componente que muestra un mensaje temporal en pantalla
const MensajeAccion: React.FC<MensajeAccionProps> = ({ mensaje, onClose }) => {
  // 👉 useEffect para controlar el tiempo de visualización del mensaje
  useEffect(() => {
    // ⏲️ Después de 1 segundo, se cierra el mensaje
    const timer = setTimeout(() => {
      onClose();
    }, 1000);

    // 🔄 Cleanup para evitar problemas de memoria
    return () => clearTimeout(timer);
  }, [onClose]);

  // ✅ Renderiza el mensaje en un div con estilo
  return <div className={estilos.mensajeAccion}>{mensaje}</div>;
};

export default MensajeAccion;
