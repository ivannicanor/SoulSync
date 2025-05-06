<?php

namespace App\Controller;

use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Ruta base para todos los métodos de este controlador: /usuarios
#[Route('/usuarios', name: 'usuario_')]
class UsuarioController extends AbstractController
{
    // Ruta: POST /usuarios → Crear un nuevo usuario
    #[Route('', name: 'crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Obtener los datos JSON enviados en la solicitud
        $datos = json_decode($request->getContent(), true);

        // Extraer correo y contraseña del array recibido
        $correo = $datos['correo'] ?? null;
        $password = $datos['contraseña'] ?? null;
        $roles = $datos['roles'] ?? null;

        // Verificar que se hayan enviado ambos datos
        if (!$correo || !$password) {
            return new JsonResponse(['error' => 'Faltan datos obligatorios'], 400);
        }

        // Crear un nuevo objeto Usuario
        $usuario = new Usuario();
        $usuario->setCorreo($correo);
        $usuario->setPassword(password_hash($password, PASSWORD_BCRYPT)); // Encriptar la contraseña
        $usuario->setRoles($roles); // Asignar rol por defecto
        $usuario->setFechaCreacion(new \DateTimeImmutable()); // Fecha actual

        // Guardar el usuario en la base de datos
        $em->persist($usuario);
        $em->flush();

        // Devolver el ID del nuevo usuario creado
        return new JsonResponse(['id' => $usuario->getId()], 201);
    }

    // Ruta: GET /usuarios/{id} → Obtener datos de un usuario por su ID
    #[Route('/{id}', name: 'ver', methods: ['GET'])]
    public function ver(int $id, EntityManagerInterface $em): JsonResponse
    {
        // Buscar el usuario en la base de datos
        $usuario = $em->getRepository(Usuario::class)->find($id);

        // Si no se encuentra, devolver error 404
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        // Devolver datos básicos del usuario en formato JSON
        return new JsonResponse([
            'id' => $usuario->getId(),
            'correo' => $usuario->getCorreo(),
            'fechaCreacion' => $usuario->getFechaCreacion()->format('Y-m-d H:i:s'),
        ]);
    }
}
