import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import estilos from "../estilos.module.css";

interface Foto {
  id: number;
  url: string;
  fotoPortada: boolean;
  mimeType: string;
}

interface TarjetaPerfilProps {
  nombre: string;
  edad: number;
  ubicacion: string;
  fotos: Foto[];
  biografia: string;
  alDarLike: () => void;
  alDarDislike: () => void;
}

const TarjetaPerfil: React.FC<TarjetaPerfilProps> = ({
  nombre,
  edad,
  ubicacion,
  fotos,
  biografia,
  alDarLike,
  alDarDislike,
}) => {
  const controls = useAnimation();
  const [fotoUrl, setFotoUrl] = useState<string>("");

  // Buscar la foto portada o la primera si no hay portada
  const fotoPortada = fotos.find(f => f.fotoPortada) || fotos[0];

  useEffect(() => {
    if (!fotoPortada) {
      setFotoUrl("");
      return;
    }

    const fetchFoto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/fotos/mostrar/${fotoPortada.id}`);
        if (!response.ok) throw new Error("Error al cargar imagen");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFotoUrl(url);
      } catch (error) {
        console.error(error);
        setFotoUrl("");
      }
    };

    fetchFoto();

    return () => {
      if (fotoUrl) {
        URL.revokeObjectURL(fotoUrl);
      }
    };
  }, [fotoPortada]);

  useEffect(() => {
    controls.start({ x: 0, y: 0, opacity: 1 });
  }, [nombre, edad, ubicacion, biografia, fotoPortada, controls]);

  const manejarArrastre = (event: any, info: any) => {
    if (info.offset.x > 150) {
      controls.start({ x: 500, opacity: 0 });
      setTimeout(() => alDarLike(), 300);
    } else if (info.offset.x < -150) {
      controls.start({ x: -500, opacity: 0 });
      setTimeout(() => alDarDislike(), 300);
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
        {fotoUrl ? (
          <img src={fotoUrl} alt={nombre} className={estilos.foto} />
        ) : (
          <div className={estilos.foto}>Cargando imagen...</div>
        )}
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
