<?php

namespace App\Entity;

use App\Repository\EncuentroRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EncuentroRepository::class)]
class Encuentro
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'usuarioA')]
    private ?Usuario $usuarioA = null;

    #[ORM\ManyToOne(inversedBy: 'usuarioB')]
    private ?Usuario $usuarioB = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $fecha = null;

    /**
     * @var Collection<int, Mensaje>
     */
    #[ORM\OneToMany(targetEntity: Mensaje::class, mappedBy: 'encuentro')]
    private Collection $mensajes;

    public function __construct()
    {
        $this->mensajes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuarioA(): ?Usuario
    {
        return $this->usuarioA;
    }

    public function setUsuarioA(?Usuario $usuarioA): static
    {
        $this->usuarioA = $usuarioA;

        return $this;
    }

    public function getUsuarioB(): ?Usuario
    {
        return $this->usuarioB;
    }

    public function setUsuarioB(?Usuario $usuarioB): static
    {
        $this->usuarioB = $usuarioB;

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

    /**
     * @return Collection<int, Mensaje>
     */
    public function getMensajes(): Collection
    {
        return $this->mensajes;
    }

    public function addMensaje(Mensaje $mensaje): static
    {
        if (!$this->mensajes->contains($mensaje)) {
            $this->mensajes->add($mensaje);
            $mensaje->setEncuentro($this);
        }

        return $this;
    }

    public function removeMensaje(Mensaje $mensaje): static
    {
        if ($this->mensajes->removeElement($mensaje)) {
            // set the owning side to null (unless already changed)
            if ($mensaje->getEncuentro() === $this) {
                $mensaje->setEncuentro(null);
            }
        }

        return $this;
    }
}
