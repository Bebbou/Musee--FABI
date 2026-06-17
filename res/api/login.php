<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start(); // Démarre la session PHP pour mémoriser l'utilisateur connecté

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email']    ?? '');
$mdp   = $data['password'] ?? '';

if (!$email || !$mdp) {
    echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
    exit;
}

// Chercher l'utilisateur par email
$stmt = $pdo->prepare("SELECT * FROM utilisateurs WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($mdp, $user['mot_de_passe'])) {
    echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
    exit;
}

// Stocker l'utilisateur en session
$_SESSION['user_id']     = $user['id'];
$_SESSION['user_nom']    = $user['nom'];
$_SESSION['user_prenom'] = $user['prenom'];
$_SESSION['user_email']  = $user['email'];
$_SESSION['user_role']   = $user['role'];

echo json_encode([
    'success' => true,
    'message' => 'Connexion réussie',
    'user'    => [
        'id'               => $user['id'],
        'nom'              => $user['nom'],
        'prenom'           => $user['prenom'],
        'email'            => $user['email'],
        'role'             => $user['role'],
        'date_inscription' => $user['date_inscription'],
    ]
]);