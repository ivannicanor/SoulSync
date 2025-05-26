'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';
import LoadingScreen from '../ui/LoadingScreen';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';
import Navbar from '../home/navbar/Navbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF'];

export default function EstadisticasPage() {
  const [genero, setGenero] = useState([]);
  const [edad, setEdad] = useState([]);
  const [registroMensual, setRegistroMensual] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [incompletos, setIncompletos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();

  useEffect(() => {
    const fetchData = async () => {
      const urls: [string, (value: any) => void, boolean?][] = [
        ['/estadisticas/genero', setGenero],
        ['/estadisticas/edad', setEdad],
        ['/estadisticas/usuarios-por-mes', setRegistroMensual],
        ['/estadisticas/top-localidades', setLocalidades],
        ['/estadisticas/perfiles-incompletos', setIncompletos, true],
      ];

      try {
        for (const [endpoint, setter, isRaw] of urls) {
          const res = await fetch(`http://localhost:8000${endpoint}`);
          const data = await res.json();

          if (isRaw) {
            setter(data.total);
          } else {
            const formatted = Object.entries(data).map(([key, value]) => ({
              name: key,
              value: value,
            }));
            setter(formatted);
          }
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || autenticado === null || perfilCreado === null) {
    return <LoadingScreen />;
  }

  if (autenticado === false || perfilCreado === false) {
    return null;
  }

  return (
    <main className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">Estadísticas de usuarios</h1>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Distribución por Género</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={genero}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Distribución por Edad</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={edad}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Usuarios Registrados por Mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={registroMensual}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#FF8042" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Top 5 Localidades</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie dataKey="value" data={localidades} cx="50%" cy="50%" outerRadius={100} label>
              {localidades.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Perfiles Incompletos</h2>
        <p className="text-xl font-bold text-red-600">{incompletos}</p>
      </section>
    </main>
  );
}
