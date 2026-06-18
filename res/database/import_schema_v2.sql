-- ============================================================
-- Schéma v2 — Réservations, Guides, Visites guidées
-- ============================================================

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `visites_oeuvres`;
DROP TABLE IF EXISTS `visites_guidees`;
DROP TABLE IF EXISTS `guides_disponibilites`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `guides`;
DROP TABLE IF EXISTS `tranches_age`;

SET FOREIGN_KEY_CHECKS=1;

-- ── Tranches d'âge & tarifs ───────────────────────────────
CREATE TABLE `tranches_age` (
  `id`      INT          NOT NULL AUTO_INCREMENT,
  `libelle` VARCHAR(50)  NOT NULL,
  `age_min` INT          NOT NULL,
  `age_max` INT          DEFAULT NULL COMMENT 'NULL = pas de maximum',
  `prix`    DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tranches_age` (`libelle`, `age_min`, `age_max`, `prix`) VALUES
  ('Gratuit (0-5 ans)',   0,   5,    0.00),
  ('Enfant (6-17 ans)',   6,   17,   6.00),
  ('Jeune (18-25 ans)',   18,  25,   8.00),
  ('Adulte (26-59 ans)',  26,  59,   12.00),
  ('Senior (60 ans +)',   60,  NULL, 9.00);

-- ── Guides ────────────────────────────────────────────────
CREATE TABLE `guides` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `nom`        VARCHAR(100) NOT NULL,
  `prenom`     VARCHAR(100) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `telephone`  VARCHAR(20)  DEFAULT NULL,
  `specialite` INT          DEFAULT NULL COMMENT 'salle_id = mouvement artistique',
  `bio`        TEXT         DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  FOREIGN KEY (`specialite`) REFERENCES `salles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Disponibilités des guides ─────────────────────────────
CREATE TABLE `guides_disponibilites` (
  `id`          INT  NOT NULL AUTO_INCREMENT,
  `guide_id`    INT  NOT NULL,
  `date`        DATE NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin`   TIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`guide_id`) REFERENCES `guides`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Réservations ──────────────────────────────────────────
CREATE TABLE `reservations` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `utilisateur_id`   INT          NOT NULL,
  `nom_reservation`  VARCHAR(255) NOT NULL,
  `date_visite`      DATE         NOT NULL,
  `horaire`          TIME         NOT NULL,
  `avec_guide`       TINYINT(1)   NOT NULL DEFAULT 0,
  `nb_gratuit`       INT          NOT NULL DEFAULT 0 COMMENT '0-5 ans',
  `nb_enfants`       INT          NOT NULL DEFAULT 0 COMMENT '6-17 ans',
  `nb_jeunes`        INT          NOT NULL DEFAULT 0 COMMENT '18-25 ans',
  `nb_adultes`       INT          NOT NULL DEFAULT 0 COMMENT '26-59 ans',
  `nb_seniors`       INT          NOT NULL DEFAULT 0 COMMENT '60+ ans',
  `prix_global`      DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `statut`           ENUM('en_attente','confirmee','annulee','payee') NOT NULL DEFAULT 'en_attente',
  `date_reservation` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentaire`      TEXT         DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Visites guidées ───────────────────────────────────────
CREATE TABLE `visites_guidees` (
  `id`             INT  NOT NULL AUTO_INCREMENT,
  `reservation_id` INT  NOT NULL,
  `guide_id`       INT  DEFAULT NULL,
  `duree_estimee`  INT  DEFAULT NULL COMMENT 'En minutes',
  `notes`          TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`guide_id`) REFERENCES `guides`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Oeuvres souhaitées ────────────────────────────────────
CREATE TABLE `visites_oeuvres` (
  `visite_id` INT NOT NULL,
  `oeuvre_id` INT NOT NULL,
  `ordre`     INT DEFAULT NULL,
  PRIMARY KEY (`visite_id`, `oeuvre_id`),
  FOREIGN KEY (`visite_id`) REFERENCES `visites_guidees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`oeuvre_id`) REFERENCES `oeuvres`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
