<?php
namespace App\EventSubscriber;

use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;

class EnsurePerfilSubscriber implements EventSubscriberInterface
{
    private Security $security;
    private RouterInterface $router;

    public function __construct(Security $security, RouterInterface $router)
    {
        $this->security = $security;
        $this->router = $router;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 10],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $rutaActual = $request->attributes->get('_route');

        // Si la ruta aún no está resuelta, salimos
        if (!$rutaActual) {
            return;
        }


        // Evitar bloquear las rutas públicas o relacionadas al perfil
        $rutasPermitidas = [
            'api_login',
            'api_register',
            'api_logout',
            'perfil_api_crear_perfiles',
            'perfil_mi_perfil',
            'api_validar_token',
            'sugerencia_',
            'sugerencia_listar',
            'sugerencia_listar_todos',
            'admin_login',
            'admin',
            'estadisticas_',
            'estadisticas_genero',
            'estadisticas_edad',
            'estadisticas_usuarios_por_mes',
            'estadisticas_top_localidades',
            'estadisticas_perfiles_incompletos',
            'api/perfiles',
            'perfil_actualizar',
            'mensaje_',
            'mensaje_ver_por_encuentro',
            'encuentro_',
            'encuentro_ver_por_usuario',
            'encuentro_ver_por_usuario_Matches',
            'mensaje_crear',
            'like_crear',
            'foto_',
            'foto_crear',
            'foto_subir_binaria',
            'foto_ver_binaria',
            'foto_ver_por_perfil',
            'foto_eliminar',
            'foto_mostrar_foto',

        ];

        if (in_array($rutaActual, $rutasPermitidas, true)) {
            return;
        }

        $usuario = $this->security->getUser();

        if (!$usuario || !$usuario->getPerfil()) {
            $event->setResponse(new JsonResponse([
                'error' => 'Debes crear tu perfil antes de continuar.'
            ], 403));
        }
    }
}
