<?php

namespace App\Controller;

use App\Entity\Perfil;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Security;


// Ruta base para este controlador: /perfiles
#[Route('/perfiles', name: 'perfil_')]
class PerfilController extends AbstractController
{
    // Ruta: POST /perfiles → Crear un nuevo perfil
    #[Route('', name: 'crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        // Recoger datos del cuerpo de la petición

        //Al tener JWT no hace falta el id de usuario en el body, ya que se obtiene del token
        //$usuarioId = $datos['usuario_id'] ?? null;

        $usuario = $this->getUser();
        if (!$usuario instanceof Usuario) {
            return new JsonResponse(['error' => 'Usuario no autenticado'], 401);
        }

        $nombre = $datos['nombre'] ?? null;
        $edad = $datos['edad'] ?? null;
        $genero = $datos['genero'] ?? null;
        $biografia = $datos['biografia'] ?? null;
        $ubicacion = $datos['ubicacion'] ?? null;
        $preferenciaSexual = $datos['preferencia_sexual'] ?? null;
        $rangoEdadMin = $datos['rango_edad_min'] ?? null;
        $rangoEdadMax = $datos['rango_edad_max'] ?? null;


        // Comprobar campos obligatorios
        if (!$usuario || !$nombre || !$edad || !$genero) {
            return new JsonResponse(['error' => 'Faltan campos obligatorios'], 400);
        }

        // Buscar al usuario en la base de datos (No es necesario si se obtiene del token)
        // Si se quiere buscar por id, descomentar la siguiente línea y comentar la anterior
        //$usuario = $em->getRepository(Usuario::class)->find($usuarioId);

        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }
        // Comprobar si el usuario ya tiene un perfil
        // Si el usuario ya tiene un perfil, devolver error
        if ($usuario->getPerfil()) {
            return new JsonResponse(['error' => 'Este usuario ya tiene un perfil'], 400);
        }

        // Validar género
        if (!in_array($genero, ['hombre', 'mujer'])) {
            return new JsonResponse(['error' => 'El género debe ser "hombre" o "mujer"'], 400);
        }

        // Validar preferencia sexual
        if (!in_array($preferenciaSexual, ['hombre', 'mujer'])) {
            return new JsonResponse(['error' => 'La preferencia sexual debe ser "hombre" o "mujer"'], 400);
        }

        // Validar rango de edad
        if ($rangoEdadMin >= $rangoEdadMax) {
            return new JsonResponse(['error' => 'El rango de edad mínimo debe ser menor que el máximo'], 400);
        }






        // Crear el perfil
        $perfil = new Perfil();
        $perfil->setUsuario($usuario);
        $perfil->setNombre($nombre);
        $perfil->setEdad($edad);
        $perfil->setGenero($genero);
        $perfil->setBiografia($biografia);
        $perfil->setUbicacion($ubicacion);
        $perfil->setPreferenciaSexual($preferenciaSexual);
        $perfil->setRangoEdadMin($rangoEdadMin);
        $perfil->setRangoEdadMax($rangoEdadMax);


        $em->persist($perfil);
        $em->flush();

        return new JsonResponse(['id' => $perfil->getId()], 201);
    }

    // Ruta: PUT /perfiles/{id} → Actualizar un perfil existente
    #[Route('/{id}', name: 'actualizar', methods: ['PUT'])]
    public function actualizar(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        Security $security
    ): JsonResponse {
        $perfil = $em->getRepository(Perfil::class)->find($id);
        if (!$perfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
        }

        // Obtener el usuario autenticado
        $usuarioActual = $security->getUser();

        // Verificar que el perfil le pertenezca
        if ($perfil->getUsuario() !== $usuarioActual) {
            return new JsonResponse(['error' => 'No tienes permiso para editar este perfil'], 403);
        }

        $datos = json_decode($request->getContent(), true);

        // Actualizar los campos si están presentes en la petición
        if (isset($datos['nombre'])) {
            $perfil->setNombre($datos['nombre']);
        }
        if (isset($datos['edad'])) {
            $perfil->setEdad($datos['edad']);
        }
        if (isset($datos['genero'])) {
            if (!in_array($datos['genero'], ['hombre', 'mujer'])) {
                return new JsonResponse(['error' => 'El género debe ser "hombre" o "mujer"'], 400);
            }
            $perfil->setGenero($datos['genero']);
        }

        if (isset($datos['biografia'])) {
            $perfil->setBiografia($datos['biografia']);
        }
        if (isset($datos['ubicacion'])) {
            $perfil->setUbicacion($datos['ubicacion']);
        }
        if (isset($datos['preferencia_sexual'])) {
            if (!in_array($datos['preferencia_sexual'], ['hombre', 'mujer'])) {
                return new JsonResponse(['error' => 'La preferencia sexual debe ser "hombre" o "mujer"'], 400);
            }
            $perfil->setPreferenciaSexual($datos['preferencia_sexual']);
        }

        if (isset($datos['rango_edad_min']) && isset($datos['rango_edad_max'])) {
            if ($datos['rango_edad_min'] >= $datos['rango_edad_max']) {
                return new JsonResponse(['error' => 'El rango de edad mínimo debe ser menor que el máximo'], 400);
            }
            $perfil->setRangoEdadMin($datos['rango_edad_min']);
            $perfil->setRangoEdadMax($datos['rango_edad_max']);
        }


        $em->flush();

        return new JsonResponse(['mensaje' => 'Perfil actualizado correctamente']);
    }

    //Obtener el perfil del usuario autenticado
    // Ruta: GET /perfiles/me → Obtener el perfil del usuario autenticado
    #[Route('/me', name: 'mi_perfil', methods: ['GET'])]
    public function miPerfil(): JsonResponse
    {
        $usuario = $this->getUser();
        if (!$usuario instanceof Usuario) {
            return new JsonResponse(['error' => 'Usuario no autenticado'], 401);
        }

        $perfil = $usuario->getPerfil();
        if (!$perfil) {
            return new JsonResponse(['perfil_creado' => false]);
        }

        return new JsonResponse([
            'perfil_creado' => true,
            'datos' => [
                'nombre' => $perfil->getNombre(),
                'edad' => $perfil->getEdad(),
                'genero' => $perfil->getGenero(),
                'ubicacion' => $perfil->getUbicacion(),
                'preferenciaSexual' => $perfil->getPreferenciaSexual(),
                'rangoEdadMin' => $perfil->getRangoEdadMin(),
                'rangoEdadMax' => $perfil->getRangoEdadMax(),
                'biografia' => $perfil->getBiografia(),
            ]
        ]);
    }

}
