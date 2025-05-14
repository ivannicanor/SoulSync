"use client";

import React from "react";
import estilos from "../estilos.module.css"; // Importamos los estilos para los botones

// Definimos una interfaz para especificar qué propiedades recibirá el componente
interface Props {
  onLike: () => void;        // Función que se ejecuta al dar "Like"
  onDislike: () => void;     // Función que se ejecuta al dar "Dislike"
  onSuperLike: () => void;   // Función que se ejecuta al dar "Super Like"
}

/**
 * ✅ Componente ControlesPerfil
 * Este componente muestra los botones de interacción (Like, Dislike y SuperLike)
 * para que el usuario pueda realizar acciones en los perfiles.
 */
const ControlesPerfil: React.FC<Props> = ({ onLike, onDislike, onSuperLike }) => {
  return (
    <div className={estilos.contenedorBotones}>
      {/* 
        💔 Botón para "Dislike"
        - Está envuelto en un div con clase "botonWrapper" para darle un aspecto más estilizado.
        - Cuando se pulsa, se ejecuta la función "onDislike".
      */}
      <div className={estilos.botonWrapper}>
        <button className={estilos.botonDislike} onClick={onDislike}>
          💔
        </button>
      </div>

      {/* 
        ⭐ Botón para "Super Like"
        - Misma estructura que el anterior, pero con un icono de estrella.
        - Cuando se pulsa, se ejecuta la función "onSuperLike".
      */}
      <div className={estilos.botonWrapper}>
        <button className={estilos.botonSuperLike} onClick={onSuperLike}>
          ⭐
        </button>
      </div>

      {/* 
        ❤️ Botón para "Like"
        - Misma estructura, pero con un icono de corazón.
        - Cuando se pulsa, se ejecuta la función "onLike".
      */}
      <div className={estilos.botonWrapper}>
        <button className={estilos.botonLike} onClick={onLike}>
          ❤️
        </button>
      </div>
    </div>
  );
};

export default ControlesPerfil;
