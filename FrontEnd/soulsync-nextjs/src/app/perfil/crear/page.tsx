'use client';

import React, { useState, useEffect } from 'react';
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
  });

  const [fotos, setFotos] = useState<File[]>([]);
  const [vistaPrevia, setVistaPrevia] = useState<string[]>([]);
  const [fotoPortadaIndex, setFotoPortadaIndex] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (fotos.length > 0) {
      const previews = fotos.map((foto) => URL.createObjectURL(foto));
      setVistaPrevia(previews);
    }
  }, [fotos]);

  if (autenticado === null) return <LoadingScreen />;
  if (autenticado === false) {
    router.push('/login');
    return null;
  }

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarCambioFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const respuestaPerfil = await fetch('http://localhost:8000/api/perfiles/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      if (!respuestaPerfil.ok) {
        const error = await respuestaPerfil.json();
        setMensaje(error.message || 'Error al crear el perfil');
        return;
      }

     const data = await respuestaPerfil.json();
    const perfilId = data.id;

      // Subir cada foto individualmente
      for (let i = 0; i < fotos.length; i++) {
        const formData = new FormData();
        formData.append('perfil_id', perfilId);
        formData.append('foto_portada', i === fotoPortadaIndex ? '1' : '0');
        formData.append('imagen', fotos[i]);

        await fetch('http://localhost:8000/fotos/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      router.push('/home');
    } catch (err) {
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

        <label>Sube tus fotos</label>
        <input type="file" multiple accept="image/*" onChange={manejarCambioFotos} />

        {vistaPrevia.length > 0 && (
          <div className={estilos.galeria}>
            {vistaPrevia.map((url, index) => (
              <div key={index} className={estilos.imagenContainer}>
                <img src={url} alt={`foto-${index}`} className={estilos.imagen} />
                <label>
                  <input
                    type="radio"
                    name="fotoPortada"
                    checked={fotoPortadaIndex === index}
                    onChange={() => setFotoPortadaIndex(index)}
                  />
                  Portada
                </label>
              </div>
            ))}
          </div>
        )}

        <button type="submit">Crear perfil</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
};

export default CrearPerfil;
