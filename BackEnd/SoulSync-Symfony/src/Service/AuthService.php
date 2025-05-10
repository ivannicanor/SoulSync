<?php
namespace App\Service;

use Symfony\Bundle\SecurityBundle\Security;
use App\Entity\Usuario;

class AuthService
{
    public function __construct(
        private Security $security
    ) {}

    public function getUsuarioActual(): ?Usuario
    {
        $usuario = $this->security->getUser();
        if (!$usuario instanceof Usuario) {
            return null;
        }

        return $usuario;
    }
}

//APLICAR SERVICIO EN CONTROLADOR
/*use App\Service\AuthService;

public function ejemplo(AuthService $authService): JsonResponse
{
    $usuario = $authService->getUsuarioActual();

    if (!$usuario) {
        return new JsonResponse(['error' => 'Usuario no autenticado'], 401);
    }

    return new JsonResponse([
        'id' => $usuario->getId(),
        'correo' => $usuario->getCorreo(),
    ]);
}
*/
