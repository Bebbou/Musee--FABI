-- Import salles (mouvements) + categories + liens oeuvres
SET FOREIGN_KEY_CHECKS=0;

INSERT IGNORE INTO `salles` (`id`, `nom`) VALUES
(1, 'Pop Art'),
(2, 'Symbolisme'),
(3, 'Romantisme'),
(4, 'Impressionnisme'),
(5, 'Baroque'),
(6, 'Réalisme'),
(7, 'Expressionnisme'),
(8, 'Réalisme américain'),
(9, 'Baroque tardif'),
(10, 'Régionalisme américain'),
(11, 'Réalisme contemporain'),
(12, 'Néoclassicisme'),
(13, 'Primitifs flamands'),
(14, 'Précurseur de l\'impressionnisme'),
(15, 'Siècle d\'or néerlandais'),
(16, 'Ukiyo-e'),
(17, 'Haute Renaissance'),
(18, 'Cubisme'),
(19, 'Surréalisme'),
(20, 'Première Renaissance florentine'),
(21, 'Post-impressionnisme');

INSERT IGNORE INTO `categories` (`id`, `nom`, `description`) VALUES
(1, 'peinture', 'Peintures et tableaux'),
(2, 'sculpture', 'Sculptures et installations'),
(3, 'photographie', 'Photographies et tirages'),
(4, 'numerique', 'Art numérique et multimédia'),
(5, 'autre', 'Autres formes d\'art');

-- Mise à jour oeuvres avec salle_id et type
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=17 WHERE `id`=1;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=2;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=7 WHERE `id`=3;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=15 WHERE `id`=4;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=20 WHERE `id`=5;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=5 WHERE `id`=6;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=7;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=6 WHERE `id`=8;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=9;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=10;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=16 WHERE `id`=11;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=10 WHERE `id`=12;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=2 WHERE `id`=13;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=17 WHERE `id`=14;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=15;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=15 WHERE `id`=16;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=13 WHERE `id`=17;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=12 WHERE `id`=18;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=12 WHERE `id`=19;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=13 WHERE `id`=20;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=8 WHERE `id`=21;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=9 WHERE `id`=22;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=23;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=2 WHERE `id`=24;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=2 WHERE `id`=25;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=26;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=14 WHERE `id`=27;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=8 WHERE `id`=28;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=29;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=18 WHERE `id`=30;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=18 WHERE `id`=31;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=32;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=33;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=18 WHERE `id`=34;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=35;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=36;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=37;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=19 WHERE `id`=38;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=1 WHERE `id`=39;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=1 WHERE `id`=40;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=1 WHERE `id`=41;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=18 WHERE `id`=42;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=43;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=44;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=45;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=21 WHERE `id`=46;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=47;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=48;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=49;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=11 WHERE `id`=50;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=51;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=7 WHERE `id`=52;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=4 WHERE `id`=53;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=15 WHERE `id`=54;
UPDATE `oeuvres` SET `type`='peinture', `salle_id`=3 WHERE `id`=55;

INSERT IGNORE INTO `oeuvres_categories` (`oeuvre_id`, `categorie_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1),
(47, 1),
(48, 1),
(49, 1),
(50, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1);

SET FOREIGN_KEY_CHECKS=1;