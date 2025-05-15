import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const usePerfilGuard = () => {
  const [perfilCreado, setPerfilCreado] = useState<null | boolean>(null);
  const router = useRouter();

  useEffect(() => {
    const verificarPerfil = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setPerfilCreado(false);
        router.replace("/login"); // Si no hay token ni perfil, mandamos a login
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/perfiles/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Si la API no responde bien, forzar logout (quizá token inválido)
          localStorage.removeItem("token");
          setPerfilCreado(false);
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (!data.perfil_creado) {
          // Usuario sin perfil, redirigimos a crear perfil
          setPerfilCreado(false);
          router.replace("/perfil/crear");
          return;
        }

        // Perfil creado
        setPerfilCreado(true);
      } catch (error) {
        console.error("Error verificando perfil:", error);
        localStorage.removeItem("token");
        setPerfilCreado(false);
        router.replace("/login");
      }
    };

    verificarPerfil();
  }, [router]);

  return perfilCreado;
};
