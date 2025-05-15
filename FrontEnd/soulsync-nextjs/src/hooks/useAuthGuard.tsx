import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook de protección de rutas. Verifica que exista un token válido en el backend.
 */
export const useAuthGuard = () => {
  const [autenticado, setAutenticado] = useState<null | boolean>(null);
  const router = useRouter();

  useEffect(() => {
    const verificar = async () => {
      const token = localStorage.getItem("token");

      // Si no hay token, redirige directamente
      if (!token) {
        setAutenticado(false);
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/validar-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setAutenticado(true);
        } else {
          localStorage.removeItem("token");
          setAutenticado(false);
          router.replace("/login");
        }
      } catch (err) {
        console.error("Error validando token:", err);
        localStorage.removeItem("token");
        setAutenticado(false);
        router.replace("/login");
      }
    };

    verificar();
  }, [router]);

  return autenticado;
};
