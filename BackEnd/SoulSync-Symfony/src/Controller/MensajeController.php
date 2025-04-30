<?php

namespace App\Controller;

use App\Entity\Mensaje;
use App\Entity\Usuario;
use App\Entity\Encuentro;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Ruta base: /mensajes
#[Route('/mensajes', name: 'mensaje_')]
class MensajeController extends AbstractController
{
    // POST /mensajes → Enviar un mensaje
    #[Route('', name: 'crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        $encuentroId = $datos['encuentro_id'] ?? null;
        $remitenteId = $datos['remitente_id'] ?? null;
        $contenido = $datos['contenido'] ?? null;

        if (!$encuentroId || !$remitenteId || !$contenido) {
            return new JsonResponse(['error' => 'Faltan datos obligatorios'], 400);
        }

        $encuentro = $em->getRepository(Encuentro::class)->find($encuentroId);
        $remitente = $em->getRepository(Usuario::class)->find($remitenteId);

        if (!$encuentro || !$remitente) {
            return new JsonResponse(['error' => 'Encuentro o remitente no encontrado'], 404);
        }

        // Validar que el remitente pertenece a ese encuentro
        if (
            $encuentro->getUsuarioA()->getId() !== $remitenteId &&
            $encuentro->getUsuarioB()->getId() !== $remitenteId
        ) {
            return new JsonResponse(['error' => 'El remitente no pertenece a este encuentro'], 403);
        }

        $mensaje = new Mensaje();
        $mensaje->setEncuentro($encuentro);
        $mensaje->setRemitente($remitente);
        $mensaje->setContenido($contenido);
        $mensaje->setFechaEnvio(new \DateTimeImmutable());

        $em->persist($mensaje);
        $em->flush();

        return new JsonResponse(['id' => $mensaje->getId()], 201);
    }

    // GET /mensajes/encuentro/{id} → Ver todos los mensajes de un encuentro
    #[Route('/encuentro/{id}', name: 'ver_por_encuentro', methods: ['GET'])]
    public function verPorEncuentro(int $id, EntityManagerInterface $em): JsonResponse
    {
        $encuentro = $em->getRepository(Encuentro::class)->find($id);
        if (!$encuentro) {
            return new JsonResponse(['error' => 'Encuentro no encontrado'], 404);
        }

        $mensajes = $encuentro->getMensajes();

        $datos = [];

        foreach ($mensajes as $mensaje) {
            $datos[] = [
                'id' => $mensaje->getId(),
                'contenido' => $mensaje->getContenido(),
                'remitente_id' => $mensaje->getRemitente()->getId(),
                'fecha_envio' => $mensaje->getFechaEnvio()->format('Y-m-d H:i:s')
            ];
        }

        return new JsonResponse($datos);
    }
}
