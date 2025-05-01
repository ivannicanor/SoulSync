<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250501102156 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE encuentro (id INT AUTO_INCREMENT NOT NULL, usuario_a_id INT DEFAULT NULL, usuario_b_id INT DEFAULT NULL, fecha DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_CDFA77FA52A42948 (usuario_a_id), INDEX IDX_CDFA77FA401186A6 (usuario_b_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE foto (id INT AUTO_INCREMENT NOT NULL, perfil_id INT DEFAULT NULL, url VARCHAR(255) NOT NULL, foto_portada TINYINT(1) NOT NULL, INDEX IDX_EADC3BE557291544 (perfil_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE `like` (id INT AUTO_INCREMENT NOT NULL, usuario_origen_id INT DEFAULT NULL, usuario_destino_id INT DEFAULT NULL, fecha DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_AC6340B31A6974DF (usuario_origen_id), INDEX IDX_AC6340B317064CB7 (usuario_destino_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE mensaje (id INT AUTO_INCREMENT NOT NULL, encuentro_id INT DEFAULT NULL, remitente_id INT DEFAULT NULL, contenido LONGTEXT NOT NULL, fecha_envio DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_9B631D01E304C7C8 (encuentro_id), INDEX IDX_9B631D011C3E945F (remitente_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE perfil (id INT AUTO_INCREMENT NOT NULL, usuario_id INT DEFAULT NULL, nombre VARCHAR(255) NOT NULL, edad INT NOT NULL, genero VARCHAR(50) NOT NULL, biografia LONGTEXT DEFAULT NULL, ubicacion VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_96657647DB38439E (usuario_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, correo VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL COMMENT '(DC2Type:json)', fecha_creacion DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', available_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', delivered_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE encuentro ADD CONSTRAINT FK_CDFA77FA52A42948 FOREIGN KEY (usuario_a_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE encuentro ADD CONSTRAINT FK_CDFA77FA401186A6 FOREIGN KEY (usuario_b_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE foto ADD CONSTRAINT FK_EADC3BE557291544 FOREIGN KEY (perfil_id) REFERENCES perfil (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B31A6974DF FOREIGN KEY (usuario_origen_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `like` ADD CONSTRAINT FK_AC6340B317064CB7 FOREIGN KEY (usuario_destino_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE mensaje ADD CONSTRAINT FK_9B631D01E304C7C8 FOREIGN KEY (encuentro_id) REFERENCES encuentro (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE mensaje ADD CONSTRAINT FK_9B631D011C3E945F FOREIGN KEY (remitente_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil ADD CONSTRAINT FK_96657647DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE encuentro DROP FOREIGN KEY FK_CDFA77FA52A42948
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE encuentro DROP FOREIGN KEY FK_CDFA77FA401186A6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE foto DROP FOREIGN KEY FK_EADC3BE557291544
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B31A6974DF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340B317064CB7
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE mensaje DROP FOREIGN KEY FK_9B631D01E304C7C8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE mensaje DROP FOREIGN KEY FK_9B631D011C3E945F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil DROP FOREIGN KEY FK_96657647DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE encuentro
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE foto
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE `like`
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE mensaje
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE perfil
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE usuario
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messenger_messages
        SQL);
    }
}
