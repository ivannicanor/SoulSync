<?php

// src/Controller/EstadisticasController.php

namespace App\Controller;

use App\Entity\Perfil;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/estadisticas', name: 'estadisticas_')]
class EstadisticasController extends AbstractController
{
    #[Route('/genero', name: 'genero', methods: ['GET'])]
    public function genero(EntityManagerInterface $em): JsonResponse
    {
        $qb = $em->createQueryBuilder();
        $qb->select('p.genero, COUNT(p.id) as total')
            ->from(Perfil::class, 'p')
            ->groupBy('p.genero');

        $resultados = $qb->getQuery()->getResult();

        return new JsonResponse(array_column($resultados, 'total', 'genero'));
    }

    #[Route('/edad', name: 'edad', methods: ['GET'])]
    public function edad(EntityManagerInterface $em): JsonResponse
    {
        $qb = $em->createQueryBuilder();
        $qb->select('p.edad, COUNT(p.id) as total')
            ->from(Perfil::class, 'p')
            ->groupBy('p.edad')
            ->orderBy('p.edad', 'ASC');

        $resultados = $qb->getQuery()->getResult();

        return new JsonResponse(array_column($resultados, 'total', 'edad'));
    }

    #[Route('/usuarios-por-mes', name: 'usuarios_por_mes', methods: ['GET'])]
    public function usuariosPorMes(EntityManagerInterface $em): JsonResponse
    {
        $conn = $em->getConnection();
        $sql = "SELECT DATE_FORMAT(fecha_creacion, '%Y-%m') as mes, COUNT(*) as total FROM usuario GROUP BY mes ORDER BY mes ASC";
        $resultados = $conn->executeQuery($sql)->fetchAllAssociative();

        return new JsonResponse(array_column($resultados, 'total', 'mes'));
    }

#[Route('/top-localidades', name: 'top_localidades', methods: ['GET'])]
public function estadisticasTopLocalidades(EntityManagerInterface $em): JsonResponse
{
    $qb = $em->createQueryBuilder();
    $qb->select('p.ubicacion, COUNT(p.id) as total')
        ->from(Perfil::class, 'p')
        ->where('p.ubicacion IS NOT NULL')
        ->groupBy('p.ubicacion')
        ->orderBy('total', 'DESC')
        ->setMaxResults(5);

    $resultados = $qb->getQuery()->getResult();

    $estadisticas = [];
    foreach ($resultados as $resultado) {
        $estadisticas[$resultado['ubicacion']] = (int) $resultado['total'];
    }

    return new JsonResponse($estadisticas);
}


    #[Route('/perfiles-incompletos', name: 'perfiles_incompletos', methods: ['GET'])]
    public function perfilesIncompletos(EntityManagerInterface $em): JsonResponse
    {
        $qb = $em->createQueryBuilder();
        $qb->select('COUNT(u.id) as total')
            ->from(Usuario::class, 'u')
            ->leftJoin('u.perfil', 'p')
            ->where('p.id IS NULL');

        $total = $qb->getQuery()->getSingleScalarResult();

        return new JsonResponse(['perfiles_incompletos' => (int) $total]);
    }
}
