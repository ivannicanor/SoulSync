<?php

namespace App\Entity;

use App\Repository\PerfilRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PerfilRepository::class)]
class Perfil
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'perfil', cascade: ['persist', 'remove'])]
    private ?Usuario $usuario = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column]
    private ?int $edad = null;

    #[ORM\Column(length: 50)]
    private ?string $genero = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $biografia = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $ubicacion = null;

    

    /**
     * @var Collection<int, Foto>
     */
    #[ORM\OneToMany(targetEntity: Foto::class, mappedBy: 'perfil')]
    private Collection $fotos;

    #[ORM\Column(length: 255)]
    private ?string $preferenciaSexual = null;

    #[ORM\Column]
    private ?int $rangoEdadMin = null;

    #[ORM\Column]
    private ?int $rangoEdadMax = null;

    #[ORM\Column(nullable: true)]
    private ?array $hobbies = null;

    public function __construct()
    {
       
        $this->fotos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getEdad(): ?int
    {
        return $this->edad;
    }

    public function setEdad(int $edad): static
    {
        $this->edad = $edad;

        return $this;
    }

    public function getGenero(): ?string
    {
        return $this->genero;
    }

    public function setGenero(string $genero): static
    {
        $this->genero = $genero;

        return $this;
    }

    public function getBiografia(): ?string
    {
        return $this->biografia;
    }

    public function setBiografia(?string $biografia): static
    {
        $this->biografia = $biografia;

        return $this;
    }

    public function getUbicacion(): ?string
    {
        return $this->ubicacion;
    }

    public function setUbicacion(?string $ubicacion): static
    {
        $this->ubicacion = $ubicacion;

        return $this;
    }

    /**
     * @return Collection<int, Foto>
     */
    public function getFotos(): Collection
    {
        return $this->fotos;
    }

    public function addFoto(Foto $foto): static
    {
        if (!$this->fotos->contains($foto)) {
            $this->fotos->add($foto);
            $foto->setPerfil($this);
        }

        return $this;
    }

    public function removeFoto(Foto $foto): static
    {
        if ($this->fotos->removeElement($foto)) {
            // set the owning side to null (unless already changed)
            if ($foto->getPerfil() === $this) {
                $foto->setPerfil(null);
            }
        }

        return $this;
    }

    public function getPreferenciaSexual(): ?string
    {
        return $this->preferenciaSexual;
    }

    public function setPreferenciaSexual(string $preferenciaSexual): static
    {
        $this->preferenciaSexual = $preferenciaSexual;

        return $this;
    }

    public function getRangoEdadMin(): ?int
    {
        return $this->rangoEdadMin;
    }

    public function setRangoEdadMin(int $rangoEdadMin): static
    {
        $this->rangoEdadMin = $rangoEdadMin;

        return $this;
    }

    public function getRangoEdadMax(): ?int
    {
        return $this->rangoEdadMax;
    }

    public function setRangoEdadMax(int $rangoEdadMax): static
    {
        $this->rangoEdadMax = $rangoEdadMax;

        return $this;
    }

    public function getHobbies(): ?array
    {
        return $this->hobbies;
    }

    public function setHobbies(?array $hobbies): static
    {
        $this->hobbies = $hobbies;

        return $this;
    }
}
