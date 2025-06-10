<?php

namespace App\Controller;

use App\Entity\Foto;
use App\Entity\Perfil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/fotos', name: 'foto_')]
class FotoController extends AbstractController
{
    // POST /fotos → Subir una nueva foto con URL (ya existente)
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

    // NUEVA: POST /fotos/upload → Subir imagen como binario
    #[Route('/upload', name: 'subir_binaria', methods: ['POST'])]
    public function subirFotoBinaria(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $perfilId = $request->request->get('perfil_id');
        $fotoPortada = filter_var($request->request->get('foto_portada', false), FILTER_VALIDATE_BOOLEAN);
        $archivo = $request->files->get('imagen');

        if (!$perfilId || !$archivo) {
            return new JsonResponse(['error' => 'Perfil ID e imagen son obligatorios'], 400);
        }

        $perfil = $em->getRepository(Perfil::class)->find($perfilId);
        if (!$perfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
        }

        if ($fotoPortada) {
            foreach ($perfil->getFotos() as $fotoExistente) {
                $fotoExistente->setFotoPortada(false);
            }
        }

        $datos = file_get_contents($archivo->getPathname());
        $mimeType = $archivo->getMimeType();

        $foto = new Foto();
        $foto->setPerfil($perfil);
        $foto->setDatos($datos);
        $foto->setMimeType($mimeType);
        $foto->setFotoPortada($fotoPortada);

        $em->persist($foto);
        $em->flush();

        return new JsonResponse(['id' => $foto->getId()], 201);
    }

    //
#[Route('/mostrar/{id}', name: 'mostrar_foto', methods: ['GET'])]
public function mostrar(int $id, EntityManagerInterface $em): Response
{
    $foto = $em->getRepository(Foto::class)->find($id);
    if (!$foto) {
        return new JsonResponse(['error' => 'Foto no encontrada'], 404);
    }

    $contenido = $foto->getDatos();

    // Convertir recurso en string si es necesario
    if (is_resource($contenido)) {
        $contenido = stream_get_contents($contenido);
    }

    return new Response(
        $contenido,
        200,
        ['Content-Type' => $foto->getMimeType()]
    );
}

    // ACTUALIZADO: GET /fotos/perfil/{id} → incluir base64 si es binario
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
            $fotoData = [
                'id' => $foto->getId(),
                'foto_portada' => $foto->isFotoPortada(),
            ];

            if ($foto->getUrl()) {
                $fotoData['tipo'] = 'url';
                $fotoData['url'] = $foto->getUrl();
            } else {
                $fotoData['tipo'] = 'binaria';
                $fotoData['base64'] = 'data:' . $foto->getMimeType() . ';base64,' . base64_encode(stream_get_contents($foto->getDatos()));
            }

            $datos[] = $fotoData;
        }

        return new JsonResponse($datos);
    }

    // DELETE /fotos/borrar/{id}
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

    #[Route('/borrarFotos/{perfilId}', name: 'borrar_fotos_perfil', methods: ['DELETE'])]
public function borrarFotosPerfil(int $perfilId, EntityManagerInterface $em): JsonResponse
{
    $fotos = $em->getRepository(Foto::class)->findBy(['perfil' => $perfilId]);

    if (!$fotos) {
        return new JsonResponse(['error' => 'No se encontraron fotos para ese perfil'], 404);
    }

    foreach ($fotos as $foto) {
        $em->remove($foto);
    }
    $em->flush();

    return new JsonResponse(['mensaje' => 'Fotos del perfil eliminadas correctamente']);
}
}
