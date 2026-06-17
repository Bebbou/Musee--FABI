-- ============================================================
--  Musée FABI — Script de création de la base de données
--  À importer dans phpMyAdmin (Import > SQL)
-- ============================================================

-- ------------------------------------------------------------
-- ARTISTES
-- ------------------------------------------------------------
CREATE TABLE artistes (
  id            INT           NOT NULL AUTO_INCREMENT,
  nom           VARCHAR(255)  NOT NULL,
  prenom        VARCHAR(255),
  nationalite   VARCHAR(100),
  biographie    TEXT,
  date_naissance VARCHAR(20),
  date_deces     VARCHAR(20),
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- SALLES
-- ------------------------------------------------------------
CREATE TABLE salles (
  id          INT           NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(255)  NOT NULL,
  description TEXT,
  position_x  FLOAT,
  position_z  FLOAT,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE categories (
  id          INT           NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(255)  NOT NULL UNIQUE,
  description TEXT,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- OEUVRES
-- ------------------------------------------------------------
CREATE TABLE oeuvres (
  id             INT          NOT NULL AUTO_INCREMENT,
  titre          VARCHAR(255) NOT NULL,
  description    TEXT,
  annee_creation VARCHAR(10),
  type           ENUM('peinture', 'sculpture', 'photographie', 'numerique', 'autre'),
  artiste_id     INT,
  salle_id       INT,
  image_path     VARCHAR(500),
  modele_3d_path VARCHAR(500),
  PRIMARY KEY (id),
  FOREIGN KEY (artiste_id) REFERENCES artistes(id) ON DELETE SET NULL,
  FOREIGN KEY (salle_id)   REFERENCES salles(id)   ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- OEUVRES_CATEGORIES  (table pivot N—N)
-- ------------------------------------------------------------
CREATE TABLE oeuvres_categories (
  oeuvre_id    INT NOT NULL,
  categorie_id INT NOT NULL,
  PRIMARY KEY (oeuvre_id, categorie_id),
  FOREIGN KEY (oeuvre_id)    REFERENCES oeuvres(id)    ON DELETE CASCADE,
  FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- UTILISATEURS
-- ------------------------------------------------------------
CREATE TABLE utilisateurs (
  id               INT          NOT NULL AUTO_INCREMENT,
  nom              VARCHAR(255) NOT NULL,
  prenom           VARCHAR(255) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe     VARCHAR(255) NOT NULL,
  role             ENUM('visiteur', 'guide', 'admin') NOT NULL DEFAULT 'visiteur',
  date_inscription VARCHAR(30),
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- VISITES_GUIDEES
-- ------------------------------------------------------------
CREATE TABLE visites_guidees (
  id          INT          NOT NULL AUTO_INCREMENT,
  titre       VARCHAR(255) NOT NULL,
  description TEXT,
  duree_min   INT,
  prix        FLOAT,
  places_max  INT,
  date_heure  VARCHAR(30)  NOT NULL,
  guide_id    INT,
  PRIMARY KEY (id),
  FOREIGN KEY (guide_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- VISITES_OEUVRES  (table pivot N—N)
-- ------------------------------------------------------------
CREATE TABLE visites_oeuvres (
  visite_id INT NOT NULL,
  oeuvre_id INT NOT NULL,
  ordre     INT,
  PRIMARY KEY (visite_id, oeuvre_id),
  FOREIGN KEY (visite_id) REFERENCES visites_guidees(id) ON DELETE CASCADE,
  FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(id)         ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- RESERVATIONS
-- ------------------------------------------------------------
CREATE TABLE reservations (
  id               INT         NOT NULL AUTO_INCREMENT,
  utilisateur_id   INT         NOT NULL,
  visite_id        INT,
  type             ENUM('individuelle', 'groupe', 'scolaire') NOT NULL DEFAULT 'individuelle',
  date_visite      VARCHAR(30) NOT NULL,
  nb_personnes     INT,
  statut           ENUM('en_attente', 'confirmee', 'annulee') NOT NULL DEFAULT 'en_attente',
  date_reservation VARCHAR(30),
  PRIMARY KEY (id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)    ON DELETE CASCADE,
  FOREIGN KEY (visite_id)      REFERENCES visites_guidees(id) ON DELETE SET NULL
);
