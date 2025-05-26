<?php

namespace App\Controller;

use App\Entity\Perfil;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;


// Ruta base para este controlador: /perfiles
#[Route('api/perfiles', name: 'perfil_')]
class PerfilController extends AbstractController
{

    // Ruta: PUT /perfiles/{id} → Actualizar un perfil existente
    #[Route(path: '/{id}', name: 'actualizar', methods: ['PUT'])]
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

    //RUTA USADA EN EL FRONT PARA OBTENER LOS DATOS DEL PERFIL!!!
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
                'id' => $perfil->getId(),
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


    //RUTA USADA EN EL FRONT PARA CREAR UN PERFIL!!!
    #[Route('/crear', name: 'api_crear_perfiles', methods: ['POST'])]
    public function crearPerfil(Request $request, EntityManagerInterface $em, Security $security): JsonResponse
    {
        $usuario = $security->getUser();
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no autenticado'], 401);
        }

        $data = json_decode($request->getContent(), true);

        $perfil = new Perfil();
        $perfil->setUsuario($usuario);
        $perfil->setNombre($data['nombre'] ?? '');
        $perfil->setEdad((int) $data['edad']);
        $perfil->setGenero($data['genero'] ?? '');
        $perfil->setBiografia($data['biografia'] ?? null);
        $perfil->setUbicacion($data['ubicacion'] ?? null);
        $perfil->setPreferenciaSexual($data['preferenciaSexual'] ?? '');
        $perfil->setRangoEdadMin((int) $data['rangoEdadMin']);
        $perfil->setRangoEdadMax((int) $data['rangoEdadMax']);

        $em->persist($perfil);
        $em->flush();

        return new JsonResponse(['mensaje' => 'Perfil creado'], 201);
    }

}
