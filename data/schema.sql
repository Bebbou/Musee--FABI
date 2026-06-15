-- ============================================================
--  MUSÉE FABI — Schéma de base de données
-- ============================================================

-- ─── Artistes ────────────────────────────────────────────────
CREATE TABLE artistes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nom             TEXT    NOT NULL,
    prenom          TEXT,
    nationalite     TEXT,
    biographie      TEXT,
    date_naissance  TEXT,
    date_deces      TEXT
);

-- ─── Salles ──────────────────────────────────────────────────
CREATE TABLE salles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL,
    description TEXT,
    position_x  REAL    DEFAULT 0,   -- coordonnée 3D (viewer)
    position_z  REAL    DEFAULT 0
);

-- ─── Catégories ──────────────────────────────────────────────
CREATE TABLE categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL UNIQUE,
    description TEXT
);

-- ─── Œuvres ──────────────────────────────────────────────────
CREATE TABLE oeuvres (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    titre           TEXT    NOT NULL,
    description     TEXT,
    annee_creation  TEXT,
    type            TEXT    CHECK(type IN ('peinture','sculpture','dessin','photo','autre')),
    artiste_id      INTEGER REFERENCES artistes(id) ON DELETE SET NULL,
    salle_id        INTEGER REFERENCES salles(id)   ON DELETE SET NULL,
    image_path      TEXT,
    modele_3d_path  TEXT    -- chemin vers le .glb si sculpture 3D
);

-- Liaison œuvres ↔ catégories (many-to-many)
CREATE TABLE oeuvres_categories (
    oeuvre_id    INTEGER NOT NULL REFERENCES oeuvres(id)    ON DELETE CASCADE,
    categorie_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (oeuvre_id, categorie_id)
);

-- ─── Utilisateurs ────────────────────────────────────────────
CREATE TABLE utilisateurs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nom              TEXT    NOT NULL,
    prenom           TEXT    NOT NULL,
    email            TEXT    NOT NULL UNIQUE,
    mot_de_passe     TEXT    NOT NULL,   -- toujours stocker hashé (bcrypt)
    role             TEXT    NOT NULL DEFAULT 'visiteur'
                             CHECK(role IN ('visiteur','guide','admin')),
    date_inscription TEXT    NOT NULL DEFAULT (DATE('now'))
);

-- ─── Visites guidées ─────────────────────────────────────────
CREATE TABLE visites_guidees (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titre       TEXT    NOT NULL,
    description TEXT,
    duree_min   INTEGER,                 -- durée en minutes
    prix        REAL    DEFAULT 0.0,
    places_max  INTEGER DEFAULT 20,
    date_heure  TEXT    NOT NULL,
    guide_id    INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Parcours : quelles œuvres dans quelle visite, dans quel ordre
CREATE TABLE visites_oeuvres (
    visite_id  INTEGER NOT NULL REFERENCES visites_guidees(id) ON DELETE CASCADE,
    oeuvre_id  INTEGER NOT NULL REFERENCES oeuvres(id)         ON DELETE CASCADE,
    ordre      INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (visite_id, oeuvre_id)
);

-- ─── Réservations ────────────────────────────────────────────
CREATE TABLE reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    visite_id   INTEGER REFERENCES visites_guidees(id) ON DELETE SET NULL,
    type        TEXT    NOT NULL CHECK(type IN ('billet','visite_guidee')),
    date_visite TEXT    NOT NULL,
    nb_personnes INTEGER NOT NULL DEFAULT 1,
    statut      TEXT    NOT NULL DEFAULT 'en_attente'
                        CHECK(statut IN ('en_attente','confirmee','annulee')),
    date_reservation TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- ─── Données de départ ───────────────────────────────────────

INSERT INTO salles (nom, description, position_x, position_z) VALUES
    ('Entrée Centrale',     'Hall principal du musée',           0,    0),
    ('Galerie Nord',        'Art moderne et contemporain',       0,  -22),
    ('Aile Est',            'Sculptures antiques',              22,    0),
    ('Aile Ouest',          'Peintures européennes',           -22,    0),
    ('Salle Orientale',     'Art oriental et antiquités',        0,   22),
    ('Salle Occidentale',   'Art occidental du XVIIe siècle',  14,   22);

INSERT INTO categories (nom) VALUES
    ('Antiquité'),
    ('Renaissance'),
    ('Art moderne'),
    ('Sculpture'),
    ('Peinture'),
    ('Photographie');

INSERT INTO artistes (nom, prenom, nationalite, date_naissance, date_deces) VALUES
    ('de Vinci',  'Léonard', 'Italien',  '1452', '1519'),
    ('Anonyme',   NULL,      'Grec',     NULL,    NULL);

INSERT INTO oeuvres (titre, description, annee_creation, type, artiste_id, salle_id, modele_3d_path) VALUES
    ('Vénus de Milo',
     'Statue en marbre représentant Aphrodite, déesse grecque de l''amour.',
     'vers 130-100 av. J.-C.', 'sculpture', 2, 1,
     'res/assets/3d/model_sculpture/Venus_de_milos.glb'),
    ('Victoire de Samothrace',
     'Chef-d''œuvre de la sculpture hellénistique représentant la déesse Niké.',
     'vers 190 av. J.-C.', 'sculpture', 2, 5,
     'res/assets/3d/model_sculpture/Victoire_de_samothrace.glb'),
    ('La Joconde',
     'Portrait de Lisa Gherardini, épouse de Francesco del Giocondo.',
     '1503-1519', 'peinture', 1, 1,
     NULL);
