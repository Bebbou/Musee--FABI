<?php
$dbPath = __DIR__ . '/../database/musee.db';

if (!is_dir(__DIR__ . '/../database')) {
    mkdir(__DIR__ . '/../database', 0755, true);
}

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("PRAGMA foreign_keys = ON");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS oeuvres (
            id      INTEGER PRIMARY KEY,
            nom     TEXT    NOT NULL,
            auteur  TEXT    NOT NULL
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            nom              TEXT    NOT NULL,
            prenom           TEXT    NOT NULL,
            email            TEXT    NOT NULL UNIQUE,
            mot_de_passe     TEXT    NOT NULL,
            role             TEXT    NOT NULL DEFAULT 'visiteur'
                                     CHECK(role IN ('visiteur','guide','admin')),
            date_inscription TEXT    NOT NULL DEFAULT (DATE('now'))
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notes (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            oeuvre_id       INTEGER NOT NULL,
            utilisateur_id  INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
            note            REAL    NOT NULL CHECK(note >= 0.5 AND note <= 5),
            date_note       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(oeuvre_id, utilisateur_id)
        )
    ");

    // Vue notes complète (recrée à chaque démarrage pour rester à jour)
    $pdo->exec("DROP VIEW IF EXISTS vue_notes");
    $pdo->exec("
        CREATE VIEW vue_notes AS
        SELECT
            o.id            AS oeuvre_id,
            o.nom           AS oeuvre_nom,
            o.auteur        AS oeuvre_auteur,
            u.prenom || ' ' || u.nom AS utilisateur,
            n.note,
            ROUND(AVG(n.note) OVER (PARTITION BY n.oeuvre_id) * 2) / 2 AS moyenne_globale,
            COUNT(n.id)     OVER (PARTITION BY n.oeuvre_id) AS nb_avis,
            n.date_note
        FROM notes n
        JOIN oeuvres      o ON o.id = n.oeuvre_id
        JOIN utilisateurs u ON u.id = n.utilisateur_id
        ORDER BY n.date_note DESC
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS commentaires (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            oeuvre_id           INTEGER NOT NULL,
            utilisateur_id      INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
            contenu             TEXT    NOT NULL,
            date_commentaire    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()]);
    exit;
}
