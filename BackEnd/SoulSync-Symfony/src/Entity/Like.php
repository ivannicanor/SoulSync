<?php

namespace App\Entity;

use App\Repository\LikeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LikeRepository::class)]
#[ORM\Table(name: '`like`')]
class Like
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'likeOrigen')]
    private ?Usuario $usuarioOrigen = null;

    #[ORM\ManyToOne(inversedBy: 'likeDestino')]
    private ?Usuario $usuarioDestino = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $fecha = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuarioOrigen(): ?Usuario
    {
        return $this->usuarioOrigen;
    }

    public function setUsuarioOrigen(?Usuario $usuarioOrigen): static
    {
        $this->usuarioOrigen = $usuarioOrigen;

        return $this;
    }

    public function getUsuarioDestino(): ?Usuario
    {
        return $this->usuarioDestino;
    }

    public function setUsuarioDestino(?Usuario $usuarioDestino): static
    {
        $this->usuarioDestino = $usuarioDestino;

        return $this;
    }

    public function getFecha(): ?\DateTimeImmutable
    {
        return $this->fecha;
    }

    public function setFecha(\DateTimeImmutable $fecha): static
    {
        $this->fecha = $fecha;

        return $this;
    }
}
