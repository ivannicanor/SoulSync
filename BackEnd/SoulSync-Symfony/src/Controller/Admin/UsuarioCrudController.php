<?php

namespace App\Controller\Admin;

use App\Entity\Usuario;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;

class UsuarioCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Usuario::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            // Aquí definimos los campos para el CRUD
            IdField::new('id')->hideOnForm(), // Escondemos el campo 'id' en los formularios
            TextField::new('correo')->setLabel('Correo Electrónico'),
            TextField::new('password')->setLabel('Contraseña')->hideOnIndex(), // Ocultamos la contraseña en la lista
            ArrayField::new('roles')->setLabel('Roles'), // Para manejar los roles
            DateTimeField::new('fechaCreacion')->setLabel('Fecha de Creación'), // No permitir modificar fecha
        ];
    }
}
