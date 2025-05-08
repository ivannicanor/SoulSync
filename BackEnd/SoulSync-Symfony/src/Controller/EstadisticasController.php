<?php

namespace App\Controller;

use App\Entity\Perfil;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/estadisticas', name: 'estadisticas_')]
class EstadisticasController extends AbstractController
{
    #[Route('/genero', name: 'genero', methods: ['GET'])]
    public function estadisticasGenero(EntityManagerInterface $em): JsonResponse
    {
        $qb = $em->createQueryBuilder();
        $qb->select('p.genero, COUNT(p.id) as total')
            ->from(Perfil::class, 'p')
            ->groupBy('p.genero');

        $resultados = $qb->getQuery()->getResult();

        $estadisticas = [];
        foreach ($resultados as $resultado) {
            $estadisticas[$resultado['genero']] = (int) $resultado['total'];
        }

        return new JsonResponse($estadisticas);
    }
    #[Route('/edad', name: 'edad', methods: ['GET'])]
    public function estadisticasEdad(EntityManagerInterface $em): JsonResponse
    {
        $qb = $em->createQueryBuilder();
        $qb->select('p.edad, COUNT(p.id) as total')
            ->from(Perfil::class, 'p')
            ->groupBy('p.edad')
            ->orderBy('p.edad', 'ASC');

        $resultados = $qb->getQuery()->getResult();

        $estadisticas = [];
        foreach ($resultados as $resultado) {
            $estadisticas[$resultado['edad']] = (int) $resultado['total'];
        }

        return new JsonResponse($estadisticas);
    }
}
