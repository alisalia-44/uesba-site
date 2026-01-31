<?php
// Connexion à la base de données
$host = "localhost";
$user = "root";
$pass = "";
$db = "UESBA";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connexion échouée: " . $conn->connect_error);
}

// Supprimer un message si demandé
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM messages_contact WHERE id=$id");
}

// Récupérer tous les messages
$result = $conn->query("SELECT * FROM messages_contact ORDER BY date_envoi DESC");
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mini Admin - Messages Contact</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        a { color: red; text-decoration: none; }
    </style>
</head>
<body>
    <h2>Messages Contact</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
            <th>Action</th>
        </tr>
        <?php while($row = $result->fetch_assoc()) : ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= htmlspecialchars($row['nom']) ?></td>
            <td><?= htmlspecialchars($row['email']) ?></td>
            <td><?= htmlspecialchars($row['message']) ?></td>
            <td><?= $row['date_envoi'] ?></td>
            <td><a href="?delete=<?= $row['id'] ?>" onclick="return confirm('Supprimer ce message ?')">Supprimer</a></td>
        </tr>
        <?php endwhile; ?>
    </table>
</body>
</html>