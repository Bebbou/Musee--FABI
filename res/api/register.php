<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true);
$nom    = trim($data['nom']    ?? '');
$prenom = trim($data['prenom'] ?? '');
$email  = trim($data['email']  ?? '');
$mdp    = $data['password']    ?? '';

if (!$nom || !$prenom || !$email || !$mdp) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

if (strlen($mdp) < 6) {
    echo json_encode(['success' => false, 'message' => 'Le mot de passe doit faire au moins 6 caractères']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)");
$stmt->execute([$nom, $prenom, $email, $mdp]);

echo json_encode(['success' => true, 'message' => 'Compte créé avec succès']);
