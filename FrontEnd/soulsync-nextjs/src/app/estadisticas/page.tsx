'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '../ui/LoadingScreen';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePerfilGuard } from '@/hooks/usePerfilGuard';
import Navbar from '../home/navbar/Navbar';
import { motion } from 'framer-motion';
import './styles.css';

// Paleta de colores más moderna y coherente con el resto de la aplicación
const COLORS = ['#7b61ff', '#9061ff', '#a661ff', '#c261ff', '#e061ff'];

export default function EstadisticasPage() {
  const [genero, setGenero] = useState([]);
  const [edad, setEdad] = useState([]);
  const [registroMensual, setRegistroMensual] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [incompletos, setIncompletos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateBackground, setAnimateBackground] = useState(false);
  const autenticado = useAuthGuard();
  const perfilCreado = usePerfilGuard();

  // Generar posiciones de partículas una sola vez con useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

  useEffect(() => {
    setAnimateBackground(true);
  }, []);

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
    <div className="stats-page-container">
      <Navbar />
      <div className="stats-content-wrapper">
        {/* Elementos de brillo en el fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
          <div className="glow-3"></div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((style, i) => (
            <div 
              key={i}
              className="particle"
              style={style}
            ></div>
          ))}
        </div>

        <main className="stats-main">
          <motion.h1 
            className="stats-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Estadísticas de SoulSync
          </motion.h1>

          <div className="stats-grid">
            <motion.section 
              className="stats-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="stats-card-title">Distribución por Género</h2>
              <div className="stats-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genero}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f0f0f0" />
                    <YAxis stroke="#f0f0f0" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 26, 46, 0.95)', 
                        border: '1px solid rgba(123, 97, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#f0f0f0'
                      }} 
                    />
                    <Bar dataKey="value" fill="#7b61ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section 
              className="stats-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="stats-card-title">Distribución por Edad</h2>
              <div className="stats-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={edad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f0f0f0" />
                    <YAxis stroke="#f0f0f0" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 26, 46, 0.95)', 
                        border: '1px solid rgba(123, 97, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#f0f0f0'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#9061ff" 
                      strokeWidth={2}
                      dot={{ stroke: '#9061ff', strokeWidth: 2, fill: '#1e1a2e', r: 4 }}
                      activeDot={{ stroke: '#9061ff', strokeWidth: 2, fill: '#9061ff', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section 
              className="stats-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="stats-card-title">Usuarios Registrados por Mes</h2>
              <div className="stats-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registroMensual}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#f0f0f0" />
                    <YAxis stroke="#f0f0f0" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 26, 46, 0.95)', 
                        border: '1px solid rgba(123, 97, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#f0f0f0'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#c261ff" 
                      strokeWidth={2}
                      dot={{ stroke: '#c261ff', strokeWidth: 2, fill: '#1e1a2e', r: 4 }}
                      activeDot={{ stroke: '#c261ff', strokeWidth: 2, fill: '#c261ff', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section 
              className="stats-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="stats-card-title">Top 5 Localidades</h2>
              <div className="stats-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      dataKey="value" 
                      data={localidades} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label
                      labelLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1 }}
                    >
                      {localidades.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 26, 46, 0.95)', 
                        border: '1px solid rgba(123, 97, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#f0f0f0'
                      }} 
                    />
                    <Legend 
                      formatter={(value) => <span style={{ color: '#f0f0f0' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            <motion.section 
              className="stats-card stats-card-highlight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="stats-card-title">Perfiles Incompletos</h2>
              <div className="stats-highlight-value">
                <span>2</span>
                <p className="stats-highlight-label">usuarios</p>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
