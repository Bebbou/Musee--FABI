<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5502');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Vous devez être connecté.']);
    exit;
}

require 'db.php';

// Paramètres de tri : sort=note|date|moyenne|nom  &  order=asc|desc
$sortMap = [
    'note'    => 'n.note',
    'date'    => 'n.date_note',
    'moyenne' => 'moyenne_globale',
    'nom'     => 'o.nom',
];

$sortKey = $_GET['sort']  ?? 'date';
$order   = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
$sortCol = $sortMap[$sortKey] ?? 'n.date_note';

$stmt = $pdo->prepare("
    SELECT
        o.id                                        AS oeuvre_id,
        o.nom                                       AS oeuvre_nom,
        o.auteur                                    AS oeuvre_auteur,
        n.note                                      AS ma_note,
        n.date_note,
        ROUND(AVG(all_n.note) * 2, 0) / 2          AS moyenne_globale,
        COUNT(all_n.id)                             AS nb_avis
    FROM notes n
    JOIN oeuvres o      ON o.id = n.oeuvre_id
    LEFT JOIN notes all_n ON all_n.oeuvre_id = n.oeuvre_id
    WHERE n.utilisateur_id = ?
    GROUP BY n.id, o.id, o.nom, o.auteur, n.note, n.date_note
    ORDER BY $sortCol $order
");
$stmt->execute([$_SESSION['user_id']]);
$notes = $stmt->fetchAll();

echo json_encode([
    'success'  => true,
    'count'    => count($notes),
    'sort'     => $sortKey,
    'order'    => $order,
    'notes'    => $notes,
]);
