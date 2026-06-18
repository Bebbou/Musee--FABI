<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non connecté']);
    exit;
}

require 'db.php';

$stmt = $pdo->prepare("SELECT id, nom, prenom, email, created_at FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session invalide']);
    exit;
}

echo json_encode(['success' => true, 'user' => $user]);
