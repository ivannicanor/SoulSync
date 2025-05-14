"use client";

import React, { useState } from "react";
import TarjetaPerfil from "./TarjetaPerfil/TarjetaPerfil"; // Componente que muestra la información del perfil.
import ControlesPerfil from "./controlesBotones/ControlesPerfil"; // Componente para los botones de Like, Dislike y Super Like.
import Navbar from "./navbar/Navbar"; // Componente de navegación superior.
import estilos from "./estilos.module.css"; // Estilos CSS para la página.

/// 👉 Datos de prueba para representar los perfiles (simulación de datos del backend).
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

/// 👉 Componente principal de la página.
const Home = () => {
  // Estado para controlar el índice del perfil que se muestra actualmente.
  const [indice, setIndice] = useState(0);
  // Estado para controlar si se han terminado los perfiles.
  const [sinPerfiles, setSinPerfiles] = useState(false);

  /// 👉 Función que avanza al siguiente perfil o muestra el mensaje si ya no hay más.
  const siguientePerfil = () => {
    if (indice < datosPrueba.length - 1) {
      setIndice(indice + 1); // Avanza al siguiente índice
    } else {
      setSinPerfiles(true); // Si se acaban, muestra el mensaje final.
    }
  };

  /// 👉 Función que se ejecuta al dar "Like".
  const manejarLike = () => {
    alert("Has dado Like a " + datosPrueba[indice].nombre); // Muestra una alerta
    siguientePerfil(); // Avanza al siguiente perfil
  };

  /// 👉 Función que se ejecuta al dar "Dislike".
  const manejarDislike = () => {
    alert("Has dado Dislike a " + datosPrueba[indice].nombre);
    siguientePerfil();
  };

  /// 👉 Función que se ejecuta al dar "Super Like".
  const manejarSuperLike = () => {
    alert("Has dado Super Like a " + datosPrueba[indice].nombre);
    siguientePerfil();
  };

  return (
    <div>
      {/* 👉 Navbar añadido en la parte superior */}
      <Navbar />

      <div className={estilos.contenedor}>
        {sinPerfiles ? (
          // 👉 Si ya no hay más perfiles, muestra este mensaje.
          <div className={estilos.mensajeFinal}>
            🥲 No hay más perfiles por ahora. ¡Vuelve más tarde!
          </div>
        ) : (
          // 👉 Si aún hay perfiles, muestra la tarjeta y los controles.
          <>
            <TarjetaPerfil
              {...datosPrueba[indice]} // Pasamos los datos del perfil actual
              alDarLike={manejarLike} // Pasamos la función de Like
              alDarDislike={manejarDislike} // Pasamos la función de Dislike
              alDarSuperLike={manejarSuperLike} // Pasamos la función de Super Like
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
