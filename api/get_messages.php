<?php
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "UESBA");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erreur de connexion: " . $conn->connect_error]));
}

// Requête pour récupérer tous les messages
$result = $conn->query("SELECT id, nom, email, message, date_envoi FROM messages_contact ORDER BY date_envoi DESC");

$messages = [];
while($row = $result->fetch_assoc()){
    $messages[] = $row;
}

echo json_encode($messages);

$conn->close();
?>