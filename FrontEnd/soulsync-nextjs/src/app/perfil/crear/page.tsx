'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import estilos from './crearPerfil.module.css';
import LoadingScreen from '@/app/ui/LoadingScreen';

const CrearPerfil = () => {
  const router = useRouter();
  const autenticado = useAuthGuard();

  const [formulario, setFormulario] = useState({
    nombre: '',
    edad: '',
    genero: '',
    biografia: '',
    ubicacion: '',
    preferenciaSexual: '',
    rangoEdadMin: 18,
    rangoEdadMax: 35,
    foto: '',
  });

  const [mensaje, setMensaje] = useState('');

  // Si aún no sabemos si está autenticado mostramos loader
  if (autenticado === null) return <LoadingScreen />;

  // Si no está autenticado no mostramos nada (o puedes redirigir)
  if (autenticado === false) {
    router.push('/login'); // por ejemplo, redirige al login
    return null;
  }

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const respuesta = await fetch('http://localhost:8000/api/perfiles/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      if (respuesta.ok) {
        router.push('/home'); // Redirige al home u otra ruta
      } else {
        const error = await respuesta.json();
        setMensaje(error.message || 'Error al crear el perfil');
      }
    } catch {
      setMensaje('Error al conectar con el servidor');
    }
  };

  return (
    <div className={estilos.contenedor}>
      <h1 className={estilos.titulo}>Crear Perfil</h1>

      <form onSubmit={manejarEnvio} className={estilos.formulario}>
        <input name="nombre" placeholder="Nombre" required onChange={manejarCambio} />
        <input type="number" name="edad" placeholder="Edad" required onChange={manejarCambio} />
        
        <select name="genero" required onChange={manejarCambio}>
          <option value="">Selecciona tu género</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
          <option value="otro">Otro</option>
        </select>

        <textarea name="biografia" placeholder="Biografía" onChange={manejarCambio} />
        <input name="ubicacion" placeholder="Ubicación" onChange={manejarCambio} />
        
        <select name="preferenciaSexual" required onChange={manejarCambio}>
          <option value="">Preferencia sexual</option>
          <option value="hombres">Hombres</option>
          <option value="mujeres">Mujeres</option>
          <option value="ambos">Ambos</option>
        </select>

        <input
          type="number"
          name="rangoEdadMin"
          placeholder="Edad mínima"
          min={18}
          max={100}
          onChange={manejarCambio}
          value={formulario.rangoEdadMin}
        />

        <input
          type="number"
          name="rangoEdadMax"
          placeholder="Edad máxima"
          min={formulario.rangoEdadMin}
          max={100}
          onChange={manejarCambio}
          value={formulario.rangoEdadMax}
        />

        <input
          name="foto"
          placeholder="URL de foto (opcional)"
          onChange={manejarCambio}
        />

        <button type="submit">Crear perfil</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
};

export default CrearPerfil;
