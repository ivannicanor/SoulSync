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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (decoded.roles && decoded.roles.includes("ROLE_ADMIN")) {
          setEsAdmin(true);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  return (
    <nav className={estilos.navbar}>
      <Link href="/home">
        <div className={estilos.logo}>SoulSync</div>
      </Link>

      <div className={estilos.enlaces}>
        <Link href="">
          <button className={estilos.boton}>Matches</button>
        </Link>

        <Link href="">
          <button className={estilos.boton}>Mensajes</button>
        </Link>

        {esAdmin && (
          <Link href="http://localhost:8000/api/admin">
            <button className={estilos.boton}>Admin</button>
          </Link>
        )}

        <Link href="/login">
          <button className={estilos.botonLogin}>Login</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
