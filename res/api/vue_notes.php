<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require 'db.php';

$oeuvre_id = intval($_GET['oeuvre_id'] ?? 0);

if ($oeuvre_id < 1) {
    echo json_encode(['success' => false, 'message' => 'oeuvre_id requis']);
    exit;
}

// Moyenne + nb avis
$stmt = $pdo->prepare("
    SELECT
        ROUND(AVG(note) * 2) / 2 AS moyenne,
        COUNT(*) AS nb_avis
    FROM notes
    WHERE oeuvre_id = ?
");
$stmt->execute([$oeuvre_id]);
$stats = $stmt->fetch();

// Détail des notes avec utilisateur
$stmt2 = $pdo->prepare("
    SELECT
        CONCAT(u.prenom, ' ', u.nom) AS utilisateur,
        n.note,
        n.date_note
    FROM notes n
    JOIN utilisateurs u ON u.id = n.utilisateur_id
    WHERE n.oeuvre_id = ?
    ORDER BY n.date_note DESC
");
$stmt2->execute([$oeuvre_id]);
$notes = $stmt2->fetchAll();

echo json_encode([
    'success'  => true,
    'moyenne'  => $stats['moyenne'] !== null ? (float) $stats['moyenne'] : null,
    'nb_avis'  => (int) $stats['nb_avis'],
    'notes'    => $notes,
]);
