<?php

namespace App\Controller;

use App\Entity\Foto;
use App\Entity\Perfil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Ruta base: /fotos
#[Route('/fotos', name: 'foto_')]
class FotoController extends AbstractController
{
    // POST /fotos → Subir una nueva foto a un perfil
    #[Route('', name: 'crear', methods: ['POST'])]
    public function crear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        $perfilId = $datos['perfil_id'] ?? null;
        $url = $datos['url'] ?? null;
        $fotoPortada = $datos['foto_portada'] ?? false;

        if (!$perfilId || !$url) {
            return new JsonResponse(['error' => 'Faltan campos obligatorios'], 400);
        }

        $perfil = $em->getRepository(Perfil::class)->find($perfilId);
        if (!$perfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
        }

        // Si esta es la foto de portada, desactivar las anteriores
        if ($fotoPortada) {
            foreach ($perfil->getFotos() as $fotoExistente) {
                $fotoExistente->setFotoPortada(false);
            }
        }

        $foto = new Foto();
        $foto->setPerfil($perfil);
        $foto->setUrl($url);
        $foto->setFotoPortada($fotoPortada);

        $em->persist($foto);
        $em->flush();

        return new JsonResponse(['id' => $foto->getId()], 201);
    }

    // GET /fotos/perfil/{id} → Ver todas las fotos de un perfil
    #[Route('/perfil/{id}', name: 'ver_por_perfil', methods: ['GET'])]
    public function verPorPerfil(int $id, EntityManagerInterface $em): JsonResponse
    {
        $perfil = $em->getRepository(Perfil::class)->find($id);
        if (!$perfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
        }

        $fotos = $perfil->getFotos();
        $datos = [];

        foreach ($fotos as $foto) {
            $datos[] = [
                'id' => $foto->getId(),
                'url' => $foto->getUrl(),
                'foto_portada' => $foto->isFotoPortada()
            ];
        }

        return new JsonResponse($datos);
    }

    // DELETE /fotos/borrar/{id} → Eliminar una foto
    #[Route('/borrar/{id}', name: 'eliminar', methods: ['DELETE'])]
    public function eliminar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $foto = $em->getRepository(Foto::class)->find($id);
        if (!$foto) {
            return new JsonResponse(['error' => 'Foto no encontrada'], 404);
        }

        $em->remove($foto);
        $em->flush();

        return new JsonResponse(['mensaje' => 'Foto eliminada correctamente']);
    }
}
