<?php
header('Content-Type: application/json');

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "UESBA");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erreur de connexion: " . $conn->connect_error]));
}

// Vérifier si les données sont envoyées
if(isset($_POST['nom'], $_POST['email'], $_POST['message'])) {
    $nom = $_POST['nom'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $stmt = $conn->prepare("INSERT INTO messages_contact (nom, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nom, $email, $message);

    if($stmt->execute()){
        echo json_encode(["success" => true, "message" => "Message envoyé avec succès"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors de l'envoi"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Champs manquants"]);
}

$conn->close();
?>