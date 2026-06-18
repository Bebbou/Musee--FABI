<?php
try {
    $pdo = new PDO(
        'mysql:host=web-mmi2.iutbeziers.fr;dbname=lilian.cornet_musee_fabi;charset=utf8',
        'lilian.cornet',
        'Voldemortlyl05!'
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS oeuvres (
            id      INT          NOT NULL,
            nom     VARCHAR(255) NOT NULL,
            auteur  VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id               INT          NOT NULL AUTO_INCREMENT,
            nom              VARCHAR(100) NOT NULL,
            prenom           VARCHAR(100) NOT NULL,
            email            VARCHAR(255) NOT NULL UNIQUE,
            mot_de_passe     VARCHAR(255) NOT NULL,
            role             ENUM('visiteur','guide','admin') NOT NULL DEFAULT 'visiteur',
            date_inscription DATE         NOT NULL DEFAULT (CURDATE()),
            PRIMARY KEY (id)
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notes (
            id              INT      NOT NULL AUTO_INCREMENT,
            oeuvre_id       INT      NOT NULL,
            utilisateur_id  INT      NOT NULL,
            note            DECIMAL(3,1) NOT NULL,
            date_note       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_note (oeuvre_id, utilisateur_id),
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS commentaires (
            id                  INT      NOT NULL AUTO_INCREMENT,
            oeuvre_id           INT      NOT NULL,
            utilisateur_id      INT      NOT NULL,
            contenu             TEXT     NOT NULL,
            date_commentaire    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
        )
    ");

    // Vue notes complète
    $pdo->exec("CREATE OR REPLACE VIEW vue_notes AS
        SELECT
            o.id                                        AS oeuvre_id,
            o.nom                                       AS oeuvre_nom,
            o.auteur                                    AS oeuvre_auteur,
            CONCAT(u.prenom, ' ', u.nom)               AS utilisateur,
            n.note,
            ROUND(AVG(n.note) OVER (PARTITION BY n.oeuvre_id) * 2) / 2 AS moyenne_globale,
            COUNT(n.id) OVER (PARTITION BY n.oeuvre_id)                AS nb_avis,
            n.date_note
        FROM notes n
        JOIN oeuvres      o ON o.id = n.oeuvre_id
        JOIN utilisateurs u ON u.id = n.utilisateur_id
        ORDER BY n.date_note DESC
    ");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()]);
    exit;
}
