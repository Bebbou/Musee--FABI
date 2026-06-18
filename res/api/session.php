<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();

// POST /session.php — déconnexion
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (($data['action'] ?? '') === 'logout') {
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }
}

// GET — retourne l'utilisateur connecté
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'     => $_SESSION['user_id'],
            'nom'    => $_SESSION['user_nom'],
            'prenom' => $_SESSION['user_prenom'],
            'role'   => $_SESSION['user_role'] ?? 'visiteur',
        ]
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
