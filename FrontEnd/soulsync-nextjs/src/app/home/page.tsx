'use client';

import React, { useState, useEffect } from 'react';
import TarjetaPerfil from './TarjetaPerfil/TarjetaPerfil';
import ControlesPerfil from './controlesBotones/ControlesPerfil';
import Navbar from './navbar/Navbar';
import estilos from './estilos.module.css';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoadingScreen from '../ui/LoadingScreen';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';

const Home = () => {
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const [sinPerfiles, setSinPerfiles] = useState(false);
  const [cargando, setCargando] = useState(true);

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
        const id = miPerfil.datos.id;
        console.log('ID del perfil:', id);

        // Luego obtenemos sugerencias con ese ID
        const resSugerencias = await fetch(`http://localhost:8000/sugerencias/todos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sugerencias = await resSugerencias.json();

        if (Array.isArray(sugerencias) && sugerencias.length > 0) {
          setPerfiles(sugerencias);
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

  if (autenticado === null || perfilCreado === null || cargando) {
    return <LoadingScreen />;
  }

  if (autenticado === false || perfilCreado === false) {
    return null;
  }

  const siguientePerfil = () => {
    if (indice < perfiles.length - 1) {
      setIndice(indice + 1);
    } else {
      setSinPerfiles(true);
    }
  };

  const manejarLike = () => {
    alert('Has dado Like a ' + perfiles[indice].nombre);
    siguientePerfil();
  };

  const manejarDislike = () => {
    alert('Has dado Dislike a ' + perfiles[indice].nombre);
    siguientePerfil();
  };

  const manejarSuperLike = () => {
    alert('Has dado Super Like a ' + perfiles[indice].nombre);
    siguientePerfil();
  };

  return (
    <div>
      <Navbar />

      <div className={estilos.contenedor}>
        {sinPerfiles || perfiles.length === 0 ? (
          <div className={estilos.mensajeFinal}>
            🥲 No hay más perfiles por ahora. ¡Vuelve más tarde!
          </div>
        ) : (
          <>
            <TarjetaPerfil
              {...perfiles[indice]}
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
