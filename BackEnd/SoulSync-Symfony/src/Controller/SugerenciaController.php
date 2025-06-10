<?php

namespace App\Controller;

use App\Entity\Perfil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/sugerencias', name: 'sugerencia_')]
class SugerenciaController extends AbstractController
{
    //RUTA USADA PARA OBTENER SUGERENCIAS DE PERFILES EN BASE A LOS FILTROS EN FRONT!!!
    #[Route('/{id}', name: 'listar', methods: ['GET'])]
    public function listar(int $id, EntityManagerInterface $em): JsonResponse
    {
        $miPerfil = $em->getRepository(Perfil::class)->find($id);

        if (!$miPerfil) {
            return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
        }

        $preferencia = $miPerfil->getPreferenciaSexual();
        $rangoMin = $miPerfil->getRangoEdadMin();
        $rangoMax = $miPerfil->getRangoEdadMax();
        $ubicacion = $miPerfil->getUbicacion();
        $usuarioActual = $miPerfil->getUsuario();

        if ($preferencia == "hombres") {
            $preferencia = "hombre";
        }
        if ($preferencia == "mujeres") {
            $preferencia = "mujer";
        }

        $qb = $em->createQueryBuilder();

        $qb->select('p')
            ->from(Perfil::class, 'p')
            ->where('p.genero = :preferencia')
            ->andWhere('p.edad BETWEEN :min AND :max')
            ->andWhere('p.id != :id') // No incluirse a sí mismo
            ->setParameter('preferencia', $preferencia)
            ->setParameter('min', $rangoMin)
            ->setParameter('max', $rangoMax)
            ->setParameter('id', $miPerfil->getId());

        if ($ubicacion) {
            $qb->andWhere('p.ubicacion = :ubicacion')
               ->setParameter('ubicacion', $ubicacion);
        }
         // Excluir perfiles a los que ya se les ha dado like o dislike
         $qb->leftJoin('p.usuario', 'u')
         ->leftJoin('App\\Entity\\Like', 'l', 'WITH', 'l.usuarioOrigen = :usuarioActual AND l.usuarioDestino = u')
         ->andWhere('l.id IS NULL')
         ->setParameter('usuarioActual', $usuarioActual);

        $resultados = $qb->getQuery()->getResult();

        $sugerencias = [];
        $fotos = [];

    foreach ($resultados as $perfil) {
        // Obtener las fotos del perfil
        $fotos = $perfil->getFotos()->map(function($foto) {
            return [
                'id' => $foto->getId(),
                'url' => $foto->getUrl(),
                'fotoPortada' => $foto->isFotoPortada(),
                //'datos' => $foto->getDatos(),
                'mimeType' => $foto->getMimeType()
            ];
        })->toArray();

        $sugerencias[] = [
            'id' => $perfil->getId(),
            'nombre' => $perfil->getNombre(),
            'edad' => $perfil->getEdad(),
            'genero' => $perfil->getGenero(),
            'ubicacion' => $perfil->getUbicacion(),
            'biografia' => $perfil->getBiografia(),
            'fotos' => $fotos,
            'usuarioId' => $perfil->getUsuario() ? $perfil->getUsuario()->getId() : null,
        ];
    }

        return new JsonResponse($sugerencias);
    }

    //RUTA USADA PARA OBTENER SUGERENCIAS todos los perfiles
    #[Route('/todos/{id}', name: 'listar_todos', methods: ['GET'])]
public function listarTodos(int $id, EntityManagerInterface $em): JsonResponse
{
    $miPerfil = $em->getRepository(Perfil::class)->find($id);

    if (!$miPerfil) {
        return new JsonResponse(['error' => 'Perfil no encontrado'], 404);
    }

    $qb = $em->createQueryBuilder();

    $qb->select('p')
        ->from(Perfil::class, 'p')
        ->where('p.id != :id') // Excluir el perfil actual
        ->setParameter('id', $id);

    $resultados = $qb->getQuery()->getResult();

    $sugerencias = [];
    $fotos = [];

    foreach ($resultados as $perfil) {
        // Obtener las fotos del perfil
        $fotos = $perfil->getFotos()->map(function($foto) {
            return [
                'id' => $foto->getId(),
                'url' => $foto->getUrl(),
                'fotoPortada' => $foto->isFotoPortada(),
                //'datos' => $foto->getDatos(),
                'mimeType' => $foto->getMimeType()
            ];
        })->toArray();

        $sugerencias[] = [
            'id' => $perfil->getId(),
            'nombre' => $perfil->getNombre(),
            'edad' => $perfil->getEdad(),
            'genero' => $perfil->getGenero(),
            'ubicacion' => $perfil->getUbicacion(),
            'biografia' => $perfil->getBiografia(),
            'fotos' => $fotos,
            'usuarioId' => $perfil->getUsuario() ? $perfil->getUsuario()->getId() : null,
        ];
    }

    return new JsonResponse($sugerencias);
}

}
