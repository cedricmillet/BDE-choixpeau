<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Ceremonie répartition - BDE IMMERSION</title>
    <meta charset="UTF-8" />
    <meta name="author" value="github.com/cedricmillet" />
    <meta name="description" content="Client web développé à l'arrache au dernier moment">
    <!-- CSS -->
    <link href="assets/css/style.css?v=<?php echo uniqid(); ?>" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Almendra+SC&display=swap" rel="stylesheet">
    <!-- JS -->
    <script src="assets/js/jquery-3.6.0.min.js"></script>
    <script src="assets/js/three.js"></script>
</head>
<body>
    <script src="assets/js/data.js?v=<?php echo uniqid(); ?>"></script>
    <script src="assets/js/main.js?v=<?php echo uniqid(); ?>"></script>
    
    <header>
        <div class="row">
            <div class="col-12">
                <h1>Répartition dans les maisons</h1>
            </div>
        </div>
    </header>
        
    <main class="bg-image">
        <div class="row">
            <div class="col-4">
                <div class="paper-container">
                    <h2>Apprentis mages <span id="eleves-count"></span>: </h2>
                    <ul id="eleves">
                    </ul>

                    <!--
                    <section id="settings-btn">
                        
                        <a href="">import</a>
                        <img src="assets/images/icons/fullscreen.webp" class="fullscreen" />
                    </section>-->

                </div>
                
            </div>
            <div class="col-8">
                <div id="canvas-tree-container"></div>                
            </div>

        </div>
    </main>

    
</body>
</html>