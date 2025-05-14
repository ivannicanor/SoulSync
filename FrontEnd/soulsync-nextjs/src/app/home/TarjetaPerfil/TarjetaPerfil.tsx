"use client";

import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import estilos from "../estilos.module.css";

/**
 * ✅ Interfaz que define las propiedades del componente.
 */
interface TarjetaPerfilProps {
  nombre: string;
  edad: number;
  ubicacion: string;
  foto: string;
  biografia: string;
  alDarLike: () => void;
  alDarDislike: () => void;
  alDarSuperLike: () => void;
}

/**
 * ✅ Componente de la tarjeta del perfil.
 * Muestra la información del perfil y permite arrastrar para interactuar.
 */
const TarjetaPerfil: React.FC<TarjetaPerfilProps> = ({
  nombre,
  edad,
  ubicacion,
  foto,
  biografia,
  alDarLike,
  alDarDislike,
  alDarSuperLike,
}) => {
  // Control de animaciones de Framer Motion
  const controls = useAnimation();

  /**
   * 👉 Cuando el componente cambia de datos, resetea la animación.
   */
  useEffect(() => {
    controls.start({ x: 0, y: 0, opacity: 1 });
  }, [nombre, edad, ubicacion, biografia, foto, controls]);

  /**
   * ✅ Detecta el arrastre de la tarjeta y ejecuta la acción correspondiente.
   * - Si se arrastra a la derecha → Like
   * - Si se arrastra a la izquierda → Dislike
   * - Si se arrastra hacia arriba → Super Like
   */
  const manejarArrastre = (event: any, info: any) => {
    if (info.offset.x > 150) {
      controls.start({ x: 500, opacity: 0 });
      setTimeout(() => alDarLike(), 300);
    } else if (info.offset.x < -150) {
      controls.start({ x: -500, opacity: 0 });
      setTimeout(() => alDarDislike(), 300);
    } else if (info.offset.y < -150) {
      controls.start({ y: -500, opacity: 0 });
      setTimeout(() => alDarSuperLike(), 300);
    }
  };

  return (
    <motion.div
      className={estilos.tarjeta}
      drag
      onDragEnd={manejarArrastre}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      animate={controls}
      initial={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={estilos.contenedorTarjeta}>
        <img src={foto} alt={nombre} className={estilos.foto} />
        <div className={estilos.detalles}>
          <h2>
            {nombre}, {edad}
          </h2>
          <p>{ubicacion}</p>
          <p>{biografia}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TarjetaPerfil;
