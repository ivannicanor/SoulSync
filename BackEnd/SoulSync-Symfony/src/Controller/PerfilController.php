<?php

namespace App\Controller;

use App\Entity\Perfil;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

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
        $usuarioId = $datos['usuario_id'] ?? null;
        $nombre = $datos['nombre'] ?? null;
        $edad = $datos['edad'] ?? null;
        $genero = $datos['genero'] ?? null;
        $biografia = $datos['biografia'] ?? null;
        $ubicacion = $datos['ubicacion'] ?? null;

        // Comprobar campos obligatorios
        if (!$usuarioId || !$nombre || !$edad || !$genero) {
            return new JsonResponse(['error' => 'Faltan campos obligatorios'], 400);
        }

        // Buscar al usuario en la base de datos
        $usuario = $em->getRepository(Usuario::class)->find($usuarioId);
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }
        // Comprobar si el usuario ya tiene un perfil
        // Si el usuario ya tiene un perfil, devolver error
        if ($usuario->getPerfil()) {
            return new JsonResponse(['error' => 'Este usuario ya tiene un perfil'], 400);
        }
        

        // Crear el perfil
        $perfil = new Perfil();
        $perfil->setUsuario($usuario);
        $perfil->setNombre($nombre);
        $perfil->setEdad($edad);
        $perfil->setGenero($genero);
        $perfil->setBiografia($biografia);
        $perfil->setUbicacion($ubicacion);

        $em->persist($perfil);
        $em->flush();

        return new JsonResponse(['id' => $perfil->getId()], 201);
    }

    // Ruta: PUT /perfiles/{id} → Actualizar un perfil existente
    #[Route('/{id}', name: 'actualizar', methods: ['PUT'])]
    public function actualizar(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $perfil = $em->getRepository(Perfil::class)->find($id);
        if (!$perfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
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
            $perfil->setGenero($datos['genero']);
        }
        if (isset($datos['biografia'])) {
            $perfil->setBiografia($datos['biografia']);
        }
        if (isset($datos['ubicacion'])) {
            $perfil->setUbicacion($datos['ubicacion']);
        }

        $em->flush();

        return new JsonResponse(['mensaje' => 'Perfil actualizado correctamente']);
    }
}
