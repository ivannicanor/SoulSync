<?php
// src/Controller/ControlController.php
namespace App\Controller;

use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\Usuario;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        UserProviderInterface $userProvider,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $correo = $data['correo'] ?? null;
        $password = $data['password'] ?? null;

        if (!$correo || !$password) {
            return new JsonResponse(['error' => 'Correo y contraseña requeridos'], 400);
        }

        $usuario = $userProvider->loadUserByIdentifier($correo);

        if (!$usuario || !$hasher->isPasswordValid($usuario, $password)) {
            return new JsonResponse(['error' => 'Credenciales inválidas'], 401);
        }

        $token = $jwtManager->create($usuario);

        return new JsonResponse(['token' => $token]);
    }

    // Ruta de logout
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // Aquí puedes agregar la lógica para invalidar el token (si es necesario)
        // Como los tokens JWT no requieren sesiones tradicionales, esta ruta podría ser vacía.
        return new JsonResponse(['message' => 'Logout exitoso'], 200);
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UsuarioRepository $usuarioRepo,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $correo = $data['correo'] ?? null;
        $password = $data['password'] ?? null;

        if (!$correo || !$password) {
            return new JsonResponse(['error' => 'Correo y contraseña son obligatorios'], 400);
        }

        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Formato de correo inválido'], 400);
        }

        if ($usuarioRepo->findOneBy(['correo' => $correo])) {
            return new JsonResponse(['error' => 'Ya existe una cuenta con este correo'], 400);
        }

        $usuario = new Usuario();
        $usuario->setCorreo($correo);
        $usuario->setFechaCreacion(new \DateTimeImmutable());

        // Hashear contraseña
        $hashedPassword = $passwordHasher->hashPassword($usuario, $password);
        $usuario->setPassword($hashedPassword);

        $em->persist($usuario);
        $em->flush();

        return new JsonResponse(['mensaje' => 'Usuario registrado exitosamente'], 201);
    }

}
