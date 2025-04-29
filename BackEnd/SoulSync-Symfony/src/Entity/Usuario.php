<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $correo = null;

    #[ORM\Column(length: 255)]
    private ?string $contraseña = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $fechaCreacion = null;

    #[ORM\OneToOne(mappedBy: 'usuario', cascade: ['persist', 'remove'])]
    private ?Perfil $perfil = null;

    /**
     * @var Collection<int, Like>
     */
    #[ORM\OneToMany(targetEntity: Like::class, mappedBy: 'usuarioOrigen')]
    private Collection $likeOrigen;

    /**
     * @var Collection<int, Like>
     */
    #[ORM\OneToMany(targetEntity: Like::class, mappedBy: 'usuarioDestino')]
    private Collection $likeDestino;

    public function __construct()
    {
        $this->likeOrigen = new ArrayCollection();
        $this->likeDestino = new ArrayCollection();
    }

    

   

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCorreo(): ?string
    {
        return $this->correo;
    }

    public function setCorreo(string $correo): static
    {
        $this->correo = $correo;

        return $this;
    }

    public function getContraseña(): ?string
    {
        return $this->contraseña;
    }

    public function setContraseña(string $contraseña): static
    {
        $this->contraseña = $contraseña;

        return $this;
    }

    public function getFechaCreacion(): ?\DateTimeImmutable
    {
        return $this->fechaCreacion;
    }

    public function setFechaCreacion(\DateTimeImmutable $fechaCreacion): static
    {
        $this->fechaCreacion = $fechaCreacion;

        return $this;
    }

    public function getPerfil(): ?Perfil
    {
        return $this->perfil;
    }

    public function setPerfil(?Perfil $perfil): static
    {
        // unset the owning side of the relation if necessary
        if ($perfil === null && $this->perfil !== null) {
            $this->perfil->setUsuario(null);
        }

        // set the owning side of the relation if necessary
        if ($perfil !== null && $perfil->getUsuario() !== $this) {
            $perfil->setUsuario($this);
        }

        $this->perfil = $perfil;

        return $this;
    }

    /**
     * @return Collection<int, Like>
     */
    public function getLikeOrigen(): Collection
    {
        return $this->likeOrigen;
    }

    public function addLikeOrigen(Like $likeOrigen): static
    {
        if (!$this->likeOrigen->contains($likeOrigen)) {
            $this->likeOrigen->add($likeOrigen);
            $likeOrigen->setUsuarioOrigen($this);
        }

        return $this;
    }

    public function removeLikeOrigen(Like $likeOrigen): static
    {
        if ($this->likeOrigen->removeElement($likeOrigen)) {
            // set the owning side to null (unless already changed)
            if ($likeOrigen->getUsuarioOrigen() === $this) {
                $likeOrigen->setUsuarioOrigen(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Like>
     */
    public function getLikeDestino(): Collection
    {
        return $this->likeDestino;
    }

    public function addLikeDestino(Like $likeDestino): static
    {
        if (!$this->likeDestino->contains($likeDestino)) {
            $this->likeDestino->add($likeDestino);
            $likeDestino->setUsuarioDestino($this);
        }

        return $this;
    }

    public function removeLikeDestino(Like $likeDestino): static
    {
        if ($this->likeDestino->removeElement($likeDestino)) {
            // set the owning side to null (unless already changed)
            if ($likeDestino->getUsuarioDestino() === $this) {
                $likeDestino->setUsuarioDestino(null);
            }
        }

        return $this;
    }

  
}
