<?php
/* ══════════════════════════════════════════════
   GET /res/api/sculptures_bdd.php
   Retourne toutes les sculptures depuis MySQL,
   au même format que bdd_sculpture.json.
══════════════════════════════════════════════ */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/config_mysql.php';

$pdo  = getMysqlPdo();
$rows = $pdo->query("
    SELECT
        id,
        nom_sculpture,
        auteur,
        date,
        musee_actuel,
        materiau,
        hauteur,
        poids,
        mouvement_artistique,
        particularite,
        descriptif,
        modele_3d_disponible,
        modele_3d_chemin,
        image_url
    FROM sculptures
    ORDER BY id ASC
")->fetchAll();

/* Reconstruire le champ modele_3d en objet imbriqué
   (comme dans bdd_sculpture.json) */
$sculptures = array_map(function($row) {
    return [
        'id'                  => (int) $row['id'],
        'nom_sculpture'       => $row['nom_sculpture'],
        'auteur'              => $row['auteur'],
        'date'                => $row['date'],
        'musee_actuel'        => $row['musee_actuel'],
        'materiau'            => $row['materiau'],
        'hauteur'             => $row['hauteur'],
        'poids'               => $row['poids'],
        'mouvement_artistique'=> $row['mouvement_artistique'],
        'particularite'       => $row['particularite'],
        'descriptif'          => $row['descriptif'],
        'image_url'           => $row['image_url'] ?? null,
        'modele_3d'           => [
            'disponible' => (bool) $row['modele_3d_disponible'],
            'chemin'     => $row['modele_3d_chemin'],
        ],
    ];
}, $rows);

echo json_encode(['sculptures' => $sculptures], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
