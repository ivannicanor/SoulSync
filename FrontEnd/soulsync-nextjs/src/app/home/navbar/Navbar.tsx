"use client";

import React from "react";
import Link from "next/link"; // Link de Next.js para navegación sin recarga.
import estilos from "./navbar.module.css"; // Estilos del navbar.

/// 👉 Componente para el menú de navegación superior.
const Navbar: React.FC = () => {
  return (
    <nav className={estilos.navbar}>
      {/* Logo con link al Home */}
      <Link href="/home">
        <div className={estilos.logo}>SoulSync</div>
      </Link>

      {/* Contenedor de enlaces */}
      <div className={estilos.enlaces}>
        {/* Botón para "Matches" (por ahora sin enlace) */}
        <Link href="">
          <button className={estilos.boton}>Matches</button>
        </Link>
        
        {/* Botón para "Mensajes" (por ahora sin enlace) */}
        <Link href="">
          <button className={estilos.boton}>Mensajes</button>
        </Link>
        
        {/* Botón para "Login" que redirige al login */}
        <Link href="/login">
          <button className={estilos.botonLogin}>Login</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
