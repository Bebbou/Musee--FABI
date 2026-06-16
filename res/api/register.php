<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

// On n'accepte que les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupérer les données envoyées en JSON depuis le formulaire
$data = json_decode(file_get_contents('php://input'), true);

$nom    = trim($data['nom']    ?? '');
$prenom = trim($data['prenom'] ?? '');
$email  = trim($data['email']  ?? '');
$mdp    = $data['password']    ?? '';

// Validation basique
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

// Vérifier si l'email existe déjà
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
    exit;
}

// Insérer l'utilisateur
$stmt = $pdo->prepare("INSERT INTO users (nom, prenom, email, password) VALUES (?, ?, ?, ?)");
$stmt->execute([$nom, $prenom, $email, $mdp]);

echo json_encode(['success' => true, 'message' => 'Compte créé avec succès']);