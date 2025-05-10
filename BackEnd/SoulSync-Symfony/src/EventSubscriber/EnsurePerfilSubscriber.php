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
            'perfil_crear',
            'perfil_mi_perfil' // permitir que el usuario cree su perfil o lo consulte
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
