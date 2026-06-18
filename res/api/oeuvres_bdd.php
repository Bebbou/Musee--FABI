<?php
/* ══════════════════════════════════════════════
   GET /res/api/oeuvres_bdd.php
   Retourne toutes les œuvres depuis MySQL,
   au même format que collection_musee.json.
══════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/config_mysql.php';

$pdo  = getMysqlPdo();
$rows = $pdo->query("
    SELECT
        o.id,
        o.titre,
        o.description,
        o.annee_creation,
        o.image_path,
        o.modele_3d_path,
        o.type,
        CONCAT(
            COALESCE(a.prenom, ''),
            IF(a.prenom IS NOT NULL AND a.prenom != '', ' ', ''),
            COALESCE(a.nom, 'Artiste inconnu')
        ) AS auteur_complet,
        a.nom          AS artiste_nom,
        a.prenom       AS artiste_prenom,
        a.nationalite  AS artiste_nationalite
    FROM oeuvres o
    LEFT JOIN artistes a ON o.artiste_id = a.id
    ORDER BY o.id ASC
")->fetchAll();

/* Formater au même format que collection_musee.json */
$oeuvres = array_map(function($row) {
    return [
        'id'          => (int) $row['id'],
        'nom_tableau' => $row['titre'],
        'auteur'      => trim($row['auteur_complet']) ?: 'Artiste inconnu',
        'date'        => $row['annee_creation'],
        'descriptif'  => $row['description'],
        'image_url'   => $row['image_path'],
        'type'        => $row['type'],
        /* Champs supplémentaires disponibles via la BDD */
        'artiste'     => [
            'nom'         => $row['artiste_nom'],
            'prenom'      => $row['artiste_prenom'],
            'nationalite' => $row['artiste_nationalite'],
        ],
    ];
}, $rows);

echo json_encode(['oeuvres' => $oeuvres], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
