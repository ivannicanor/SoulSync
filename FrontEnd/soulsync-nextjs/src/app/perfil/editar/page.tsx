'use client';

import LoadingScreen from '@/app/ui/LoadingScreen';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditarPerfil() {
  const [perfil, setPerfil] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editado, setEditado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();
  const autenticado = useAuthGuard();

  // Redirección segura si no está autenticado
  useEffect(() => {
    if (autenticado === false) {
      router.push('/login');
    }
  }, [autenticado, router]);

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:8000/api/perfiles/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.datos) {
        setPerfil(data.datos);
        setForm(data.datos);
      }
    };

    if (autenticado) {
      cargarPerfil();
    }
  }, [autenticado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setEditado(true);
  };

  const guardarCambios = async () => {
    const token = localStorage.getItem('token');
    if (!token || !perfil?.id) return;

    const res = await fetch(`http://localhost:8000/api/perfiles/${perfil.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMensaje('Perfil actualizado correctamente ✅');
      setEditado(false);
    } else {
      const error = await res.json();
      setMensaje(`Error: ${error.error || 'No se pudo actualizar el perfil'}`);
    }
  };

  if (autenticado === null || !perfil) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-8 bg-white rounded-xl shadow-md text-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h1>

      {mensaje && <p className="mb-4 text-sm text-center text-green-600">{mensaje}</p>}

      <div className="grid gap-4">
        <input name="nombre" value={form.nombre || ''} onChange={handleChange} placeholder="Nombre" className="border p-2 rounded w-full" />
        <input name="edad" type="number" value={form.edad || ''} onChange={handleChange} placeholder="Edad" className="border p-2 rounded w-full" />

        <select name="genero" value={form.genero || ''} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="">Selecciona tu género</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
        </select>

        <textarea name="biografia" value={form.biografia || ''} onChange={handleChange} placeholder="Biografía" className="border p-2 rounded w-full" />

        <input name="ubicacion" value={form.ubicacion || ''} onChange={handleChange} placeholder="Ubicación" className="border p-2 rounded w-full" />

        <select name="preferenciaSexual" value={form.preferenciaSexual || ''} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="">Preferencia sexual</option>
          <option value="hombres">Hombre</option>
          <option value="mujeres">Mujer</option>
        </select>

        <div className="flex gap-2">
          <input
            name="rangoEdadMin"
            type="number"
            value={form.rangoEdadMin || ''}
            onChange={handleChange}
            placeholder="Edad mínima"
            className="border p-2 rounded w-full"
          />
          <input
            name="rangoEdadMax"
            type="number"
            value={form.rangoEdadMax || ''}
            onChange={handleChange}
            placeholder="Edad máxima"
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <button
        onClick={guardarCambios}
        disabled={!editado}
        className={`mt-6 w-full p-2 rounded text-white font-bold transition ${editado ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
      >
        Guardar
      </button>
    </div>
  );
}
