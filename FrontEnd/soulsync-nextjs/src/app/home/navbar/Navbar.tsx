"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import estilos from "./navbar.module.css";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  roles: string[];
  [key: string]: any;
}

const Navbar: React.FC = () => {
  const [esAdmin, setEsAdmin] = useState(false);
  const [esManager, setEsManager] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.roles && decoded.roles.includes("ROLE_ADMIN")) {
          setEsAdmin(true);
        }
        if (decoded.roles && decoded.roles.includes("ROLE_MANAGER")) {
          setEsManager(true);
        }

        // Obtener el ID del usuario
        fetch('http://localhost:8000/api/perfiles/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(res => res.json())
        .then(data => {
          setUsuarioId(data.datos.usuarioId);
        });
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  // Función para obtener notificaciones no leídas
  const obtenerNotificacionesNoLeidas = async () => {
    if (!usuarioId) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:8000/notificaciones/usuario/${usuarioId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const notificaciones = await response.json();
        const noLeidas = notificaciones.filter((n: any) => !n.leido).length;
        setNotificacionesNoLeidas(noLeidas);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  };

  // Efecto para cargar notificaciones cuando tenemos el usuarioId
  useEffect(() => {
    if (usuarioId) {
      obtenerNotificacionesNoLeidas();
      const interval = setInterval(obtenerNotificacionesNoLeidas, 30000);
      return () => clearInterval(interval);
    }
  }, [usuarioId]);

  return (
    <nav className={estilos.navbar}>
      <Link href="/home">
        <div className={estilos.logo}>SoulSync</div>
      </Link>

      <div className={estilos.enlaces}>
        <Link href="/chat">
          <button className={estilos.boton}>Matches</button>
        </Link>

       

        {esAdmin && (
          <Link href="http://localhost:8000/admin">
            <button className={estilos.boton}>Admin</button>
          </Link>
        )}

        {esManager && (
          <Link href="/estadisticas">
            <button className={estilos.boton}>Manager</button>
          </Link>
        )}

        <div className={estilos.notificationContainer}>
          <svg 
            className={estilos.notificationBell}
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {notificacionesNoLeidas > 0 && (
            <span className={estilos.notificationBadge}>{notificacionesNoLeidas}</span>
          )}
        </div>

        <Link href="/login">
          <button className={estilos.botonLogin}>Login</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
