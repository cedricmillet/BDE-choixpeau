<?php
    session_start();
    $PWD = "cocolasticot";

    if(isset($_POST['pwd'])) {
        if($_POST['pwd'] === $PWD) {
            $_SESSION['logged'] = true;
            header('location: /');
        } else exit("ACCES INTERDIT");
    }
?>
<!-- Bonjour, je peux t'aider ? Tu as l'air perdu. -->
<!-- Tout à fait entre nous php c'est à chier mais... c'est rapide. -->

<style>
    form {
        width: 20em;
        position: relative;
        margin-left: 50%;
        margin-top: 50vh;
        transform: translate(-50%,-50%);
        padding: 1em;
        border: 2px solid black;
        text-align:center
    }
    h1, h2 { margin: 0}

    form input { width: 100%; margin-top: 1em; border: none}
    form input[type="password"] { background: black; color: #fff }
    form input[type="submit"] { color: green }
</style>


<form method="post">
    <img src="assets/images/misc/bde.jpg" />
    <h1>Anticheat</h1>
    <h2>Etes vous vraiment du BDE ?</h2>
    
    <input type="password" name="pwd" placeholder="Mot de passe" />
    <input type="submit" value="OK" />
</form>

