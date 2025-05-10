<?php

namespace App\Controller;

use App\Entity\Encuentro;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

// Ruta base: /encuentros
#[Route('/encuentros', name: 'encuentro_')]
class EncuentroController extends AbstractController
{
    // GET /encuentros/usuario/{id} → Ver todos los encuentros (matchs) de un usuario
    #[Route('/usuario/{id}', name: 'ver_por_usuario', methods: ['GET'])]
    public function verPorUsuario(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $em->getRepository(Usuario::class)->find($id);
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        try {
            // Prueba si este bloque da problemas
            $encuentros = array_merge(
                $usuario->getEncuentrosComoA()->toArray(),
                $usuario->getEncuentrosComoB()->toArray()
            );
        } catch (\Throwable $e) {
            return new JsonResponse([
                'error' => 'Error interno al obtener encuentros',
                'detalle' => $e->getMessage()
            ], 500);
        }

        $datos = [];

        foreach ($encuentros as $encuentro) {
            $otro = $encuentro->getUsuarioA() === $usuario
                ? $encuentro->getUsuarioB()
                : $encuentro->getUsuarioA();

            $datos[] = [
                'encuentro_id' => $encuentro->getId(),
                'con_usuario_id' => $otro->getId(),
                'con_correo' => $otro->getCorreo(),
                'fecha' => $encuentro->getFecha()->format('Y-m-d H:i:s')
            ];
        }

        return new JsonResponse($datos);
    }


    #[Route('/matches/{id}', name: 'listar_matches', methods: ['GET'])]
    public function listarMatches(int $id, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $em->getRepository(Usuario::class)->find($id);

        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }

        $qb = $em->createQueryBuilder();
        $qb->select('e')
            ->from(Encuentro::class, 'e')
            ->where('e.usuarioA = :usuario OR e.usuarioB = :usuario')
            ->setParameter('usuario', $usuario);

        $resultados = $qb->getQuery()->getResult();

        $matches = [];
        foreach ($resultados as $encuentro) {
            $matches[] = [
                'id' => $encuentro->getId(),
                'usuario_a_id' => $encuentro->getUsuarioA()->getId(),
                'usuario_b_id' => $encuentro->getUsuarioB()->getId(),
                'fecha' => $encuentro->getFecha()->format('Y-m-d H:i:s')
            ];
        }

        return new JsonResponse($matches);
    }
}
