<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Code de Sécurité</title>
</head>
<body>
    <h2>Bonjour {{ $prenom }} {{ $nom }},</h2>

    <p>Vous avez récemment initié une opération nécessitant une vérification de sécurité.</p>

    <p>Voici votre code de sécurité :</p>

    <h1 style="color: #2c3e50;">{{ $code }}</h1>

    <p>Ce code est valable pendant quelques minutes. Ne le partagez avec personne.</p>

    <p>Cordialement,<br>
    L'équipe de la plateforme</p>
</body>
</html>
