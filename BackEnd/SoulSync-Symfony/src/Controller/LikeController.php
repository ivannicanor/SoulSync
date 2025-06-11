<?php

namespace App\Controller;

use App\Entity\Like;
use App\Entity\Usuario;
use App\Entity\Encuentro;
use App\Entity\Notificacion;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Ruta base: /likes
#[Route('/likes', name: 'like_')]
class LikeController extends AbstractController
{
    // POST /likes → Dar like a otro usuario
    #[Route('', name: 'crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        $origenId = $datos['usuario_origen'] ?? null;
        $destinoId = $datos['usuario_destino'] ?? null;
        $booleanLike = $datos['booleanLike'] ?? null;

        if (!$origenId || !$destinoId) {
            return new JsonResponse(['error' => 'Faltan datos obligatorios'], 400);
        }

        if ($origenId == $destinoId) {
            return new JsonResponse(['error' => 'No puedes darte like a ti mismo'], 400);
        }

        $usuarioOrigen = $em->getRepository(Usuario::class)->find($origenId);
        $usuarioDestino = $em->getRepository(Usuario::class)->find($destinoId);

        if (!$usuarioOrigen || !$usuarioDestino) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        // Verificar si ya existe ese like
        $likeExistente = $em->getRepository(Like::class)->findOneBy([
            'usuarioOrigen' => $usuarioOrigen,
            'usuarioDestino' => $usuarioDestino,
        ]);

        if ($likeExistente) {
            return new JsonResponse(['mensaje' => 'Ya habías dado like'], 200);
        }

        // Crear el nuevo like
        $like = new Like();
        $like->setUsuarioOrigen($usuarioOrigen);
        $like->setUsuarioDestino($usuarioDestino);
        $like->setFecha(new \DateTimeImmutable());
        $like->setBooleanLike($booleanLike);

        $em->persist($like);

        // Verificar si hay match (el destino ya le dio like antes)
        $likeMutuo = $em->getRepository(Like::class)->findOneBy([
            'usuarioOrigen' => $usuarioDestino,
            'usuarioDestino' => $usuarioOrigen,
        ]);

        // Solo crear el encuentro si ambos likes son true
        if ($likeMutuo && $likeMutuo->isBooleanLike() === true && $like->isBooleanLike() === true) {
            // Crear el encuentro (match)
            $encuentro = new Encuentro();
            $encuentro->setUsuarioA($usuarioOrigen);
            $encuentro->setUsuarioB($usuarioDestino);
            $encuentro->setFecha(new \DateTimeImmutable());

            $em->persist($encuentro);

            // 👉 Crear la notificación para el usuario origen
            $notificacionA = new Notificacion();
            $notificacionA->setUsuario($usuarioOrigen);
            $notificacionA->setMensaje("¡Has hecho Match con " . $usuarioDestino->getPerfil()->getNombre() . "!");
            $notificacionA->setFecha(new \DateTimeImmutable());
            $notificacionA->setLeido(false);

            // 👉 Crear la notificación para el usuario destino
            $notificacionB = new Notificacion();
            $notificacionB->setUsuario($usuarioDestino);
            $notificacionB->setMensaje("¡Has hecho Match con " . $usuarioOrigen->getPerfil()->getNombre() . "!");
            $notificacionB->setFecha(new \DateTimeImmutable());
            $notificacionB->setLeido(false);

            $em->persist($notificacionA);
            $em->persist($notificacionB);

            $em->flush();

            return new JsonResponse(['mensaje' => '¡Match creado!', 'encuentro_id' => $encuentro->getId()], 201);
        }

        // Si no hay match mutuo, solo guardar el like
        $em->flush();

        return new JsonResponse(['mensaje' => 'Like registrado'], 201);
    }
}
