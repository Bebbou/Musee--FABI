<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false]);
    exit;
}

if (empty($_SESSION['user_id'])) {
    echo json_encode(['success' => true, 'notes' => []]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT oeuvre_id, note, date_note
    FROM notes
    WHERE utilisateur_id = ?
    ORDER BY date_note DESC
");
$stmt->execute([$_SESSION['user_id']]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$notes = array_map(fn($r) => [
    'oeuvre_id' => (int)$r['oeuvre_id'],
    'note'      => (float)$r['note'],
    'date_note' => $r['date_note'],
], $rows);

echo json_encode(['success' => true, 'notes' => $notes]);
