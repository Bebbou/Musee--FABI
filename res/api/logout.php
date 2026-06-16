<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

session_start();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Déconnecté']);
