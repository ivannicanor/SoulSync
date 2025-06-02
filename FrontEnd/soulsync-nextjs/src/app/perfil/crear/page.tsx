'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import estilos from './crearPerfil.module.css';
import LoadingScreen from '@/app/ui/LoadingScreen';
import hobbiesData from '../hobbies.json';

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
    hobbies: [] as string[],
  });

  const [mensaje, setMensaje] = useState('');
  const [mostrarPopupHobbies, setMostrarPopupHobbies] = useState(false);
  
  const opcionesHobbies = hobbiesData.hobbies;
  const MAX_HOBBIES = hobbiesData.maxHobbies;

  const [hobbiesSeleccionados, setHobbiesSeleccionados] = useState<string[]>([]);
  const [contadorHobbies, setContadorHobbies] = useState(0);

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

  const toggleHobby = (hobby: string) => {
    if (hobbiesSeleccionados.includes(hobby)) {
      // Si ya está seleccionado, lo quitamos
      setHobbiesSeleccionados(hobbiesSeleccionados.filter(h => h !== hobby));
      setContadorHobbies(contadorHobbies - 1);
    } else if (contadorHobbies < MAX_HOBBIES) {
      // Si no está seleccionado y no hemos llegado al máximo, lo añadimos
      setHobbiesSeleccionados([...hobbiesSeleccionados, hobby]);
      setContadorHobbies(contadorHobbies + 1);
    }
  };

  const guardarHobbies = () => {
    setFormulario(prev => ({
      ...prev,
      hobbies: hobbiesSeleccionados
    }));
    setMostrarPopupHobbies(false);
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

        <div className={estilos.interesesContainer}>
          <h3>Intereses</h3>
          <button 
            type="button" 
            className={estilos.botonIntereses}
            onClick={() => setMostrarPopupHobbies(true)}
          >
            + Añadir intereses
          </button>
          {hobbiesSeleccionados.length > 0 && (
            <div className={estilos.hobbiesSeleccionadosContainer}>
              {hobbiesSeleccionados.map(hobby => (
                <span key={hobby} className={estilos.hobbieTag}>{hobby}</span>
              ))}
            </div>
          )}
        </div>

        <button type="submit">Crear perfil</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      {mostrarPopupHobbies && (
        <div className={estilos.popupOverlay}>
          <div className={estilos.popupContainer}>
            <div className={estilos.popupHeader}>
              <h2>¿Cuál es tu rollo?</h2>
              <button 
                type="button" 
                className={estilos.closeButton}
                onClick={() => setMostrarPopupHobbies(false)}
              >
                ×
              </button>
            </div>
            <p className={estilos.popupSubtitle}>Para gustos, colores. ¡Cuéntanos lo que te va a ti!</p>
            
            <div className={estilos.hobbiesGrid}>
              {opcionesHobbies.map(hobby => (
                <button
                  key={hobby}
                  type="button"
                  className={`${estilos.hobbyOption} ${hobbiesSeleccionados.includes(hobby) ? estilos.selected : ''}`}
                  onClick={() => toggleHobby(hobby)}
                >
                  {hobby}
                </button>
              ))}
            </div>
            
            <button 
              type="button" 
              className={estilos.guardarButton}
              onClick={guardarHobbies}
            >
              Guardar ({contadorHobbies}/{MAX_HOBBIES})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearPerfil;
