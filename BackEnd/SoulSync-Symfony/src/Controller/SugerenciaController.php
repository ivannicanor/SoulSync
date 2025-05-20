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

        $resultados = $qb->getQuery()->getResult();

        $sugerencias = [];

        foreach ($resultados as $perfil) {
            $sugerencias[] = [
                'id' => $perfil->getId(),
                'nombre' => $perfil->getNombre(),
                'edad' => $perfil->getEdad(),
                'genero' => $perfil->getGenero(),
                'ubicacion' => $perfil->getUbicacion(),
                'biografia' => $perfil->getBiografia()
            ];
        }

        return new JsonResponse($sugerencias);
    }

    //RUTA USADA PARA OBTENER SUGERENCIAS DE PERFILES en FRONT!!!
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

    foreach ($resultados as $perfil) {
        $sugerencias[] = [
            'id' => $perfil->getId(),
            'nombre' => $perfil->getNombre(),
            'edad' => $perfil->getEdad(),
            'genero' => $perfil->getGenero(),
            'ubicacion' => $perfil->getUbicacion(),
            'biografia' => $perfil->getBiografia()
        ];
    }

    return new JsonResponse($sugerencias);
}

}
