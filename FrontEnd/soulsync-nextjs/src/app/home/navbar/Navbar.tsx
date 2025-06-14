"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className={estilos.navbar}>
      <Link href="/home" className={estilos.logoLink}>
        <div className={estilos.logo}>
          <span className={estilos.logoIcon}>SS</span>
          <span>SoulSync</span>
        </div>
      </Link>

      <div className={estilos.enlaces}>
        <Link href="/chat">
          <button className={estilos.boton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={estilos.buttonIcon}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Matches
          </button>
        </Link>

        {esAdmin && (
          <Link href="http://localhost:8000/admin">
            <button className={`${estilos.boton} ${estilos.botonAdmin}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={estilos.buttonIcon}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Admin
            </button>
          </Link>
        )}

        {esManager && (
          <Link href="/estadisticas">
            <button className={`${estilos.boton} ${estilos.botonManager}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={estilos.buttonIcon}>
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Manager
            </button>
          </Link>
        )}

        <div className={estilos.notificationContainer}>
          <button 
            className={estilos.notificationButton}
            onClick={toggleNotifications}
          >
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
          </button>
          
          {showNotifications && (
            <div className={estilos.notificationDropdown}>
              <h3>Notificaciones</h3>
              {notificacionesNoLeidas > 0 ? (
                <p>Tienes {notificacionesNoLeidas} notificaciones nuevas</p>
              ) : (
                <p>No tienes notificaciones nuevas</p>
              )}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className={estilos.botonLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={estilos.buttonIcon}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
