<?php

namespace App\Entity;

use App\Repository\FotoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FotoRepository::class)]
class Foto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'fotos')]
    private ?Perfil $perfil = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $url = null;

    #[ORM\Column]
    private ?bool $fotoPortada = null;

    #[ORM\Column(type: 'blob')]
    private $datos;

    #[ORM\Column(length: 100)]
    private ?string $mimeType = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPerfil(): ?Perfil
    {
        return $this->perfil;
    }

    public function setPerfil(?Perfil $perfil): static
    {
        $this->perfil = $perfil;
        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): static
    {
        $this->url = $url;
        return $this;
    }

    public function isFotoPortada(): ?bool
    {
        return $this->fotoPortada;
    }

    public function setFotoPortada(bool $fotoPortada): static
    {
        $this->fotoPortada = $fotoPortada;
        return $this;
    }

    public function getDatos()
    {
        return $this->datos;
    }

    public function setDatos($datos): static
    {
        $this->datos = $datos;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }
}
