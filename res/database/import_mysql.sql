-- Import Musée FABI → MySQL
-- À importer dans phpMyAdmin sur la base lilian.cornet_musee_fabi

CREATE TABLE IF NOT EXISTS `oeuvres` (
  `id` INT NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `auteur` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `mot_de_passe` VARCHAR(255) NOT NULL,
  `role` ENUM('visiteur','guide','admin') NOT NULL DEFAULT 'visiteur',
  `date_inscription` DATE NOT NULL DEFAULT (CURDATE()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `oeuvre_id` INT NOT NULL,
  `utilisateur_id` INT NOT NULL,
  `note` DECIMAL(3,1) NOT NULL,
  `date_note` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_note` (`oeuvre_id`, `utilisateur_id`),
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `commentaires` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `oeuvre_id` INT NOT NULL,
  `utilisateur_id` INT NOT NULL,
  `contenu` TEXT NOT NULL,
  `date_commentaire` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `oeuvres` (`id`, `nom`, `auteur`) VALUES
(1, 'La Joconde', 'Léonard de Vinci'),
(2, 'La Nuit étoilée', 'Vincent van Gogh'),
(3, 'Le Cri', 'Edvard Munch'),
(4, 'La Jeune Fille à la perle', 'Johannes Vermeer'),
(5, 'La Naissance de Vénus', 'Sandro Botticelli'),
(6, 'Les Ménines', 'Diego Velázquez'),
(7, 'La Liberté guidant le peuple', 'Eugène Delacroix'),
(8, 'Le Déjeuner sur l\'herbe', 'Édouard Manet'),
(9, 'Impression, soleil levant', 'Claude Monet'),
(10, 'Les Tournesols', 'Vincent van Gogh'),
(11, 'La Grande Vague de Kanagawa', 'Katsushika Hokusai'),
(12, 'American Gothic', 'Grant Wood'),
(13, 'Le Baiser', 'Gustav Klimt'),
(14, 'La Création d\'Adam', 'Michel-Ange'),
(15, 'Le Radeau de la Méduse', 'Théodore Géricault'),
(16, 'La Laitière', 'Johannes Vermeer'),
(17, 'Les Époux Arnolfini', 'Jan van Eyck'),
(18, 'Le Serment des Horaces', 'Jacques-Louis David'),
(19, 'La Mort de Marat', 'Jacques-Louis David'),
(20, 'Le Jardin des délices', 'Jérôme Bosch'),
(21, 'Nighthawks', 'Edward Hopper'),
(22, 'Temple Antique', 'Giovanni Paolo Panini'),
(23, 'Le Voyageur contemplant une mer de nuages', 'Caspar David Friedrich'),
(24, 'La Mort et le Fossoyeur', 'Carlos Schwabe'),
(25, 'L\'Île des morts', 'Arnold Böcklin'),
(26, 'The Burning of the Houses of Parliament', 'Joseph Mallord William Turner'),
(27, 'Sunset Near Overschie', 'Johan Barthold Jongkind'),
(28, 'The Fog Warning', 'Winslow Homer'),
(29, 'Les Amants', 'René Magritte'),
(30, 'Guernica', 'Pablo Picasso'),
(31, 'Les Demoiselles d\'Avignon', 'Pablo Picasso'),
(32, 'Le Grand Masturbateur', 'Salvador Dalí'),
(33, 'La Persistance de la mémoire', 'Salvador Dalí'),
(34, 'Massacre en Corée', 'Pablo Picasso'),
(35, 'Le Fils de l\'homme', 'René Magritte'),
(36, 'Golconde', 'René Magritte'),
(37, 'Le Trois Mai 1808', 'Francisco de Goya'),
(38, 'Ceci n\'est pas une pipe', 'René Magritte'),
(39, 'Campbell\'s Soup Cans', 'Andy Warhol'),
(40, 'Marilyn Diptych', 'Andy Warhol'),
(41, 'Eight Elvises', 'Andy Warhol'),
(42, 'Femme assise près d\'une fenêtre', 'Pablo Picasso'),
(43, 'Autoportrait à l\'oreille bandée', 'Vincent van Gogh'),
(44, 'Terrasse du café le soir', 'Vincent van Gogh'),
(45, 'Champ de blé aux corbeaux', 'Vincent van Gogh'),
(46, 'La Chambre à Arles', 'Vincent van Gogh'),
(47, 'Le Moulin de la Galette', 'Pierre-Auguste Renoir'),
(48, 'Paris Street, Rainy Day', 'Gustave Caillebotte'),
(49, 'Le Déjeuner des canotiers', 'Pierre-Auguste Renoir'),
(50, 'The Singing Butler', 'Jack Vettriano'),
(51, 'La Gare Saint-Lazare', 'Claude Monet'),
(52, 'La Tour des chevaux bleus', 'Franz Marc'),
(53, 'Les Coquelicots', 'Claude Monet'),
(54, 'Le Christ dans la tempête sur la mer de Galilée', 'Rembrandt van Rijn'),
(55, 'Saturne dévorant un de ses fils', 'Francisco de Goya');

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `date_inscription`) VALUES
(1, 'root', 'root', 'root@gmail.com', 'adminroot', 'visiteur', '2026-06-18'),
(2, 'Test', 'Jean', 'jean@test.com', '1234', 'visiteur', '2026-06-18');

INSERT INTO `notes` (`id`, `oeuvre_id`, `utilisateur_id`, `note`, `date_note`) VALUES
(1, 1, 2, 4.5, '2026-06-18 17:58:58'),
(2, 3, 1, 3.5, '2026-06-18 18:03:58'),
(3, 2, 1, 4.0, '2026-06-18 18:05:59');

INSERT INTO `commentaires` (`id`, `oeuvre_id`, `utilisateur_id`, `contenu`, `date_commentaire`) VALUES
(1, 3, 1, 'bonjour', '2026-06-18 18:04:20');

CREATE OR REPLACE VIEW `vue_notes` AS
SELECT
  o.id                                          AS oeuvre_id,
  o.nom                                         AS oeuvre_nom,
  o.auteur                                      AS oeuvre_auteur,
  CONCAT(u.prenom, ' ', u.nom)                  AS utilisateur,
  n.note,
  ROUND(AVG(n.note) OVER (PARTITION BY n.oeuvre_id) * 2) / 2 AS moyenne_globale,
  COUNT(n.id) OVER (PARTITION BY n.oeuvre_id)   AS nb_avis,
  n.date_note
FROM notes n
JOIN oeuvres      o ON o.id = n.oeuvre_id
JOIN utilisateurs u ON u.id = n.utilisateur_id
ORDER BY n.date_note DESC;
