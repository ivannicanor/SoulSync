<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;




#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $correo = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

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

    /**
     * @var Collection<int, Encuentro>
     */
    #[ORM\OneToMany(targetEntity: Encuentro::class, mappedBy: 'usuarioA')]
    private Collection $encuentrosComoA;

    /**
     * @var Collection<int, Encuentro>
     */
    #[ORM\OneToMany(targetEntity: Encuentro::class, mappedBy: 'usuarioB')]
    private Collection $encuentrosComoB;

    /**
     * @var Collection<int, Mensaje>
     */
    #[ORM\OneToMany(targetEntity: Mensaje::class, mappedBy: 'remitente')]
    private Collection $mensajes;

    /**
     * @var Collection<int, Notificacion>
     */
    #[ORM\OneToMany(targetEntity: Notificacion::class, mappedBy: 'usuario')]
    private Collection $notificaciones;

   
    public function __construct()
    {
        $this->likeOrigen = new ArrayCollection();
        $this->likeDestino = new ArrayCollection();
        $this->encuentrosComoA = new ArrayCollection();
        $this->encuentrosComoB = new ArrayCollection();
        $this->mensajes = new ArrayCollection();
        $this->notificaciones = new ArrayCollection();
       
    }

    

   

    public function getId(): ?int
    {
        return $this->id;
    }

        public function getUserIdentifier(): string
    {
        return $this->correo; // o username si usas otro campo
    }

    public function eraseCredentials(): void
    {
        // Aquí podrías limpiar datos sensibles temporales, si los hubiera.
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

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // garantiza que cada usuario tenga al menos ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

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

    /**
     * @return Collection<int, Encuentro>
     */
    public function getEncuentrosComoA(): Collection
    {
        return $this->encuentrosComoA;
    }

    public function addEncuentroComoA(Encuentro $encuentrosComoA): static
    {
        if (!$this->encuentrosComoA->contains($encuentrosComoA)) {
            $this->encuentrosComoA->add($encuentrosComoA);
            $encuentrosComoA->setUsuarioA($this);
        }

        return $this;
    }

    public function removeEncuentrosComoA(Encuentro $encuentrosComoA): static
    {
        if ($this->encuentrosComoA->removeElement($encuentrosComoA)) {
            // set the owning side to null (unless already changed)
            if ($encuentrosComoA->getUsuarioA() === $this) {
                $encuentrosComoA->setUsuarioA(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Encuentro>
     */
    public function getEncuentrosComoB(): Collection
    {
        return $this->encuentrosComoB;
    }

    public function addEncuentroComoB(Encuentro $encuentrosComoB): static
    {
        if (!$this->encuentrosComoB->contains($encuentrosComoB)) {
            $this->encuentrosComoB->add($encuentrosComoB);
            $encuentrosComoB->setUsuarioB($this);
        }

        return $this;
    }

    public function removeEncuentrosComoB(Encuentro $encuentrosComoB): static
    {
        if ($this->encuentrosComoB->removeElement($encuentrosComoB)) {
            // set the owning side to null (unless already changed)
            if ($encuentrosComoB->getUsuarioB() === $this) {
                $encuentrosComoB->setUsuarioB(null);
            }
        }

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
            $mensaje->setRemitente($this);
        }

        return $this;
    }

    public function removeMensaje(Mensaje $mensaje): static
    {
        if ($this->mensajes->removeElement($mensaje)) {
            // set the owning side to null (unless already changed)
            if ($mensaje->getRemitente() === $this) {
                $mensaje->setRemitente(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Notificacion>
     */
    public function getNotificaciones(): Collection
    {
        return $this->notificaciones;
    }

    public function addNotificacion(Notificacion $notificacion): static
    {
        if (!$this->notificaciones->contains($notificacion)) {
            $this->notificaciones->add($notificacion);
            $notificacion->setUsuario($this);
        }

        return $this;
    }

    public function removeNotificacion(Notificacion $notificacion): static
    {
        if ($this->notificaciones->removeElement($notificacion)) {
            // set the owning side to null (unless already changed)
            if ($notificacion->getUsuario() === $this) {
                $notificacion->setUsuario(null);
            }
        }

        return $this;
    }

    
  
}
