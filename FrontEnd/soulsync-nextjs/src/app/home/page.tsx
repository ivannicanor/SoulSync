"use client";

import React, { useState } from "react";
import TarjetaPerfil from "./TarjetaPerfil/TarjetaPerfil";
import ControlesPerfil from "./controlesBotones/ControlesPerfil";
import Navbar from "./navbar/Navbar";
import estilos from "./estilos.module.css";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LoadingScreen from "../ui/LoadingScreen";
import { usePerfilGuard } from "@/hooks/usePerfilGuard";

const datosPrueba = [
  {
    nombre: "Lucía",
    edad: 28,
    ubicacion: "Madrid",
    foto: "https://www.adslzone.net/app/uploads-adslzone.net/2021/12/www-vs-internet.jpg",
    biografia: "Amante de los gatos y el senderismo.",
  },
  {
    nombre: "Carlos",
    edad: 30,
    ubicacion: "Barcelona",
    foto: "https://www.adslzone.net/app/uploads-adslzone.net/2021/12/www-vs-internet.jpg",
    biografia: "Fan de la música y los videojuegos.",
  },
  {
    nombre: "Ana",
    edad: 25,
    ubicacion: "Sevilla",
    foto: "https://www.adslzone.net/app/uploads-adslzone.net/2021/12/www-vs-internet.jpg",
    biografia: "Apasionada por el arte y la fotografía.",
  },
];

const Home = () => {
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();
  const [indice, setIndice] = useState(0);
  const [sinPerfiles, setSinPerfiles] = useState(false);

  // 👉 Mientras se está validando el token, no mostramos nada (pantalla de carga)
  if (autenticado === null || perfilCreado === null) {
  return <LoadingScreen />;
  }
  if (autenticado === false) return null;
  if (perfilCreado  === false) return null;

  const siguientePerfil = () => {
    if (indice < datosPrueba.length - 1) {
      setIndice(indice + 1);
    } else {
      setSinPerfiles(true);
    }
  };

  const manejarLike = () => {
    alert("Has dado Like a " + datosPrueba[indice].nombre);
    siguientePerfil();
  };

  const manejarDislike = () => {
    alert("Has dado Dislike a " + datosPrueba[indice].nombre);
    siguientePerfil();
  };

  const manejarSuperLike = () => {
    alert("Has dado Super Like a " + datosPrueba[indice].nombre);
    siguientePerfil();
  };

  return (
    <div>
      <Navbar />

      <div className={estilos.contenedor}>
        {sinPerfiles ? (
          <div className={estilos.mensajeFinal}>
            🥲 No hay más perfiles por ahora. ¡Vuelve más tarde!
          </div>
        ) : (
          <>
            <TarjetaPerfil
              {...datosPrueba[indice]}
              alDarLike={manejarLike}
              alDarDislike={manejarDislike}
              alDarSuperLike={manejarSuperLike}
            />
            <ControlesPerfil
              onLike={manejarLike}
              onDislike={manejarDislike}
              onSuperLike={manejarSuperLike}
            />
          </>
        )}
      </div>
    </div>
  );
};


export default Home;
