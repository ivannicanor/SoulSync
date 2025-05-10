<?php

namespace App\Controller;

use App\Entity\Notificacion;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/notificaciones', name: 'notificacion_')]
class NotificacionController extends AbstractController
{
    // ✅ Ruta: GET /notificaciones/usuario/{id} → Ver todas las notificaciones de un usuario
    #[Route('/usuario/{id}', name: 'ver_todas', methods: ['GET'])]
    public function verTodas(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $em->getRepository(Usuario::class)->find($id);

        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        $notificaciones = $usuario->getNotificaciones();
        
        $datos = [];

        foreach ($notificaciones as $notificacion) {
            $datos[] = [
                'id' => $notificacion->getId(),
                'mensaje' => $notificacion->getMensaje(),
                'leido' => $notificacion->isLeido(),
                'fecha' => $notificacion->getFecha()->format('Y-m-d H:i:s')
            ];
        }

        return new JsonResponse($datos, 200);
    }

    // ✅ Ruta: PUT /notificaciones/{id}/leida → Marcar una notificación como leída
    #[Route('/{id}/leida', name: 'marcar_leida', methods: ['PUT'])]
    public function marcarLeida(int $id, EntityManagerInterface $em): JsonResponse
    {
        $notificacion = $em->getRepository(Notificacion::class)->find($id);

        if (!$notificacion) {
            return new JsonResponse(['error' => 'Notificación no encontrada'], 404);
        }

        $notificacion->setLeido(true);
        $em->flush();

        return new JsonResponse(['mensaje' => 'Notificación marcada como leída'], 200);
    }

    // ✅ Ruta: DELETE /notificaciones/{id} → Eliminar una notificación
    #[Route('/{id}', name: 'eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $notificacion = $em->getRepository(Notificacion::class)->find($id);

        if (!$notificacion) {
            return new JsonResponse(['error' => 'Notificación no encontrada'], 404);
        }

        $em->remove($notificacion);
        $em->flush();

        return new JsonResponse(['mensaje' => 'Notificación eliminada'], 200);
    }
}
