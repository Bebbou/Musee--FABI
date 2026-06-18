<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5502');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();
require 'db.php';

/* ── GET ?oeuvre_id=X ── retourne la moyenne + la note de l'user */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $oeuvre_id = intval($_GET['oeuvre_id'] ?? 0);
    if ($oeuvre_id < 1) {
        echo json_encode(['avg' => null, 'count' => 0, 'user_note' => null]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT AVG(note) as avg, COUNT(*) as count FROM notes WHERE oeuvre_id = ?");
    $stmt->execute([$oeuvre_id]);
    $row = $stmt->fetch();

    $user_note = null;
    if (!empty($_SESSION['user_id'])) {
        $stmt2 = $pdo->prepare("SELECT note FROM notes WHERE oeuvre_id = ? AND utilisateur_id = ?");
        $stmt2->execute([$oeuvre_id, $_SESSION['user_id']]);
        $r = $stmt2->fetch();
        if ($r) $user_note = (float) $r['note'];
    }

    echo json_encode([
        'avg'       => $row['avg'] !== null ? round((float)$row['avg'] * 2) / 2 : null,
        'count'     => (int) $row['count'],
        'user_note' => $user_note,
    ]);
    exit;
}

/* ── POST {oeuvre_id, note} ── enregistre / met à jour la note */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Vous devez être connecté pour noter.']);
        exit;
    }

    $data      = json_decode(file_get_contents('php://input'), true);
    $oeuvre_id = intval($data['oeuvre_id'] ?? 0);
    $note      = (float) ($data['note'] ?? 0);

    if ($oeuvre_id < 1 || $note < 0.5 || $note > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données invalides.']);
        exit;
    }

    $note = round($note * 2) / 2; // arrondi au 0.5 le plus proche

    $stmt = $pdo->prepare("
        INSERT INTO notes (oeuvre_id, utilisateur_id, note)
        VALUES (?, ?, ?)
        ON CONFLICT(oeuvre_id, utilisateur_id) DO UPDATE SET note = excluded.note, date_note = CURRENT_TIMESTAMP
    ");
    $stmt->execute([$oeuvre_id, $_SESSION['user_id'], $note]);

    $stmt2 = $pdo->prepare("SELECT AVG(note) as avg, COUNT(*) as count FROM notes WHERE oeuvre_id = ?");
    $stmt2->execute([$oeuvre_id]);
    $row = $stmt2->fetch();

    echo json_encode([
        'success'   => true,
        'avg'       => round((float)$row['avg'] * 2) / 2,
        'count'     => (int) $row['count'],
        'user_note' => $note,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
