// app/login/page.tsx (Next.js 13+ with App Router and TypeScript)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Manejamos el login y guardamos el token en localStorage
export default function LoginPage() {
  const [correo, setCorreo] = useState(''); // Campo para el correo electrónico
  const [password, setPassword] = useState(''); // Campo para la contraseña
  const [error, setError] = useState(''); // Estado para mostrar errores
  const router = useRouter();

  // Función que maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Realizamos la petición a la API de Symfony
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si la respuesta no es 200 OK, mostramos el error
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Guardamos el token en localStorage
      localStorage.setItem('token', data.token);

      // Redirigimos al usuario a crear perfil o al home
      const perfilRes = await fetch('http://localhost:8000/perfiles/mi-perfil', {
        method: 'POST',  // Verifica que el método sea el correcto (POST, PUT, etc.)
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (perfilRes.status === 403) {
        // Si no tiene perfil, redirigir a crear perfil
        router.push('/perfil/crear');
      } else {
        // Si ya tiene perfil, llevar al home (o donde definas)
        router.push('/');
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
