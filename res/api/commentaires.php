<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5502');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();
require 'db.php';

/* ── GET ?oeuvre_id=X ── liste les commentaires */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $oeuvre_id = intval($_GET['oeuvre_id'] ?? 0);
    if ($oeuvre_id < 1) {
        echo json_encode(['commentaires' => []]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT c.id, c.contenu, c.date_commentaire,
               u.prenom, u.nom
        FROM commentaires c
        JOIN utilisateurs u ON u.id = c.utilisateur_id
        WHERE c.oeuvre_id = ?
        ORDER BY c.date_commentaire DESC
    ");
    $stmt->execute([$oeuvre_id]);
    $rows = $stmt->fetchAll();

    echo json_encode(['commentaires' => $rows]);
    exit;
}

/* ── POST {oeuvre_id, contenu} ── ajoute un commentaire */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Vous devez être connecté pour commenter.']);
        exit;
    }

    $data      = json_decode(file_get_contents('php://input'), true);
    $oeuvre_id = intval($data['oeuvre_id'] ?? 0);
    $contenu   = trim($data['contenu'] ?? '');

    if ($oeuvre_id < 1 || $contenu === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données invalides.']);
        exit;
    }

    if (mb_strlen($contenu) > 1000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Commentaire trop long (max 1000 caractères).']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO commentaires (oeuvre_id, utilisateur_id, contenu)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$oeuvre_id, $_SESSION['user_id'], $contenu]);

    $stmt2 = $pdo->prepare("
        SELECT c.id, c.contenu, c.date_commentaire, u.prenom, u.nom
        FROM commentaires c
        JOIN utilisateurs u ON u.id = c.utilisateur_id
        WHERE c.id = ?
    ");
    $stmt2->execute([$pdo->lastInsertId()]);
    $nouveau = $stmt2->fetch();

    echo json_encode(['success' => true, 'commentaire' => $nouveau]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
