<?php
// Connexion à la base MySQL (phpMyAdmin)

define('DB_HOST', 'localhost');
define('DB_NAME', 'lilian.cornet');   // <- ton nom de base sur le serveur IUT
define('DB_USER', 'lilian.cornet');   // <- ton identifiant phpMyAdmin
define('DB_PASS', 'Voldemortlyl05!'); // <- ton mot de passe phpMyAdmin

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur base de données : ' . $e->getMessage()]);
    exit;
}