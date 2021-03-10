    /** 3D */
    const RADIUS_PLATEAU = 9;
    const RADIUS_MAISON = 7;
    const SIZE_MAISON = 4;
    const CAMERA_POSITION = [0,3.5,15];
    const MAISON_COUNT = 3;
    /** ANIM / FRAMERATE... */
    const ANIMATION_MIN_ROTATION = 1;
    const ANIMATION_MAX_ROTATION = 1;
    const ANIMATION_FRAME_PER_ROTATION = 200;
    const FRAME_RATE = 60;



    const getPositionMaisonByIndex = (idx, len=MAISON_COUNT) => {
        const r = RADIUS_MAISON;         /** radius */
        const h = 2.05;                  /** hauteur logo */
        const offsetAngle = - Math.PI * 2 / 6 * 0.5;

        return new THREE.Vector3( 
            Math.cos(Math.PI * 2 / len * idx + offsetAngle) * r , 
            h , 
            Math.sin(Math.PI * 2 / len * idx + offsetAngle) * r 
        );
    }    

    const MAISON_LIST = [
        {slug: 'cendrelune', img: 'assets/images/maisons/cendrelune.png', pos: getPositionMaisonByIndex(0) },
        {slug: 'brisetempete', img: 'assets/images/maisons/brisetempete.png', pos: getPositionMaisonByIndex(1) },
        {slug: 'serdelys', img: 'assets/images/maisons/serdelys.png', pos: getPositionMaisonByIndex(2) },
    ];
        
        

    const getMaison = (slug) => MAISON_LIST.find(m => m.slug === slug);
    
    class ChoixpeauScene {
        constructor(t) {
            this.camera = t.camera;
            this.scene = t.scene;
            /** roue des maisons */
            this.wheel = null;
            this.wheelItems = [];
            
            this.createObjects();
            this.addMouseEvents();
        }
        
        addMouseEvents() {
            const that = this;
            $('ul').on('click', 'li.eleve', (ev) => {
                const eleve = ev.target;
                if(eleve.classList.contains('dispatched')) return;
                if(document.querySelector('li.eleve.processing')) return;
                const m = eleve.dataset.maison;
                eleve.classList.add("processing");
                //console.log("Maison attendu = ", m);
                that.rotateAndAnimateTo(m, eleve);
            })

                    
            $( "body" ).keydown(function() {
                that.requestStopSpinning();
            });
            
            /*
            $('li.eleve').click(() => {
                const m = $(this).data('maison')
            });*/
        }

        setWheelAngle(angle) {
            this.wheel.rotation.y = angle;
            /** rotate childs */
            this.wheelItems.forEach(m => {
                m.lookAt(...CAMERA_POSITION);
            });
        }
        /** y = x . 2t */
        genConstantAnimation(startAngle,endAngle,stepCount) {
            const anim = new Array(stepCount).fill(1);
            return anim.map((v,idx) => {
                const t = idx / stepCount;
                return (endAngle-startAngle) * t * 2;
            })
        }
        /** y = x . (2.t²) */
        genEaseInAnimation(startAngle,endAngle,stepCount) {
            const anim = new Array(stepCount).fill(1);
            return anim.map((v,idx) => {
                const t = idx / stepCount;
                return (endAngle-startAngle) * (2 * Math.pow(t,2));
                //return (endAngle-startAngle) * (t*t / (2 * (t*t - t) + 1));
            })
        }
        /** y = ... */
        genEaseOutAnimation(startAngle,endAngle,stepCount) {
            const anim = new Array(stepCount).fill(1);
            return anim.map((v,idx) => {
                const t = idx / stepCount;
                /* Interpolation polynomiale
                 *  y=a+b*t+c*t² pour les points {0,1};{1,0};{1.2;-.1};{0.5,0.4} 
                 * calcul sur https://keisan.casio.com/exec/system/14059932254941
                 * */
                const [a,b,c] = [0,-1.405,0.406];
                const y = -1*(a+b*t+c*Math.pow(t,2));
                return (endAngle-startAngle) * y;

                //return (endAngle-startAngle) * (-1+(4-2*t)*t);
            })
        }

        requestStopSpinning() {
            this.stoppingRequested = true;
            console.log("Arret de la roue demandée par l'utilisateur.")
        }
        
        // fifoAnim = [];
        fifoData = null;
        rotateAndAnimateTo(item, eleve) {
            const rotationCount=Math.floor(Math.random() * ANIMATION_MAX_ROTATION) + ANIMATION_MIN_ROTATION 
            const idx = MAISON_LIST.findIndex(m => m.slug === item);
            const fraterie = MAISON_LIST.find(m => m.slug === item);
            /** check err */
            if(!fraterie) { console.error("maison inexistante : ", item); return; }
            this.fifoData = {
                eleve: eleve
            };
            this.anim = {starting: [], waiting: [], stopping: []};
            this.stoppingRequested = false;

            /** calcul des animations (acceleration, constante, deceleration) */
            const targetDegree = Math.PI * 2 / MAISON_LIST.length * (idx - 1);
            const framesByRotation = ANIMATION_FRAME_PER_ROTATION; /** coeff de vitesse */
            this.anim.starting = this.genEaseInAnimation(0, rotationCount * Math.PI*2, framesByRotation);
            this.anim.waiting = this.genConstantAnimation(0, rotationCount * Math.PI*2, framesByRotation );
            this.anim.stopping = this.genEaseOutAnimation(0, rotationCount * Math.PI*2 + targetDegree, framesByRotation);
            this.ccWaitingAnim = [...this.anim.waiting]; /* eviter le recalcul à chaque rotation => clone d'une copie temporaire */
            
            this.onAnimationStart();
        }
        
        onAnimationStart() {
            this.clearTexts();
        }
        
        onAnimationEnd() {
            const eleve = this.fifoData.eleve;
            const maison = eleve.dataset.maison;
            const nom = `${eleve.dataset.prenom} ${eleve.dataset.nom}`;
            
            // console.log("animation end : ", eleve)
            eleve.classList.add('dispatched');
            eleve.classList.remove('processing');
            document.dispatchEvent(new Event('updateMageList'));
            this.annunceHome(nom, maison);
        }
        
        anim = {starting: [], waiting: [], stopping: []};
        ccWaitingAnim = [];
        stoppingRequested = false;

        
        clock = new THREE.Clock();
        delta = 0;
        interval = 1 / FRAME_RATE;  // fps
        update() {
            /** limitation du framerate => performance++ */
            this.delta += this.clock.getDelta();
            if (this.delta  <= this.interval) return;
            this.delta = this.delta % this.interval;
            /** playing animation ? */
            if(this.anim.stopping.length==0) return;

            switch(true) {
                case this.anim.starting.length>0:
                    this.setWheelAngle(this.anim.starting[0]);
                    this.anim.starting.shift();
                    if(this.anim.starting.length===0) console.log("starting finished");
                    break;
                
                case this.anim.waiting.length>0:
                    this.setWheelAngle(this.anim.waiting[0]);
                    this.anim.waiting.shift();
                    if(this.anim.waiting.length===0 && !this.stoppingRequested) {
                        this.anim.waiting = [...this.ccWaitingAnim];
                        console.log("repopulate waiting anim")
                    }
                        
                    if(this.anim.waiting.length ===0 )console.log("waiting finished");
                    break;
                case this.anim.stopping.length>0:
                    this.setWheelAngle(this.anim.stopping[0]);
                    this.anim.stopping.shift();
                    if(this.anim.stopping.length===0) {
                        console.log("stopping finished");
                        this.onAnimationEnd();
                    }
                    break;
                default:
                    /** spinning infinite */
                    break;
            }
        }
        
        createObjects() {
            
            /** Plateau central */
            (() => {
                const geometry = new THREE.CylinderGeometry( RADIUS_PLATEAU-0.2, RADIUS_PLATEAU, .2, 100 );
                const material = new THREE.MeshStandardMaterial( {color: 0x957C49, transparent: false, opacity: .95 } );
                const cylinder = new THREE.Mesh( geometry, material );
                this.scene.add( cylinder );
            })();
            
            /** creation des mesh/geometries */
            this.wheel = new THREE.Group();
            MAISON_LIST.forEach(maison => {
                let img = new THREE.MeshBasicMaterial({
                    map:THREE.ImageUtils.loadTexture(maison.img),
                    opacity: 1,
                    transparent: true,
                });
                
                img.map.needsUpdate = true;
                // plane
                var plane = new THREE.Mesh(new THREE.PlaneGeometry(SIZE_MAISON, SIZE_MAISON), img);
                plane.overdraw = true;
                plane.position.set(...maison.pos.toArray());
                
                
                this.wheelItems.push(plane);
                this.wheel.add(plane);
            });
            
            this.scene.add(this.wheel);
        }
        

        clearTexts() {
            const scene = this.scene;
            const getText = () => scene.getObjectByName( "text", true );
            
            while( true ) {
                const t = getText();
                if(!t) break;
                scene.remove( t );
            }
        }

        annunceHome(nom, maison) {
            /** texte prenom */
            this.addText(nom, 1, 5, 5, 0xBBA635);
            /** texte maison */
            let color = 0xffffff;
            switch(maison.toLowerCase()) {
                case 'serdelys':
                    color = 0x006035;
                    break;
                case 'cendrelune':
                    color = 0x34636F;
                    break;
                case 'brisetempete':
                    color = 0xC95454;
                    break;
            }
            this.addText(maison.toUpperCase(), 0.6, 2, 11.5, color);
        }

        addText(text, size=1, y=5, z=5, color=0xffffff) {
            const that = this;
            const loader = new THREE.FontLoader();
            loader.load( 'assets/fonts/Almendra.json', function ( font ) {

                const geometry = new THREE.TextGeometry( text , {
                    font: font,
                    size: size,
                    height: .3,
                    curveSegments: 4
                } );
                geometry.center();
                const material = new THREE.MeshStandardMaterial( {
                    color: color,
                } );
                const mesh = new THREE.Mesh( geometry, material );
                mesh.name = "text";
                mesh.position.set(0,y,z);
                that.scene.add(mesh);
            } );
        }
        
    }
    
    class ThreeModulesLoader {
        static instances = [];
        
        constructor(t) {
            /** creation des instances */
            ThreeModulesLoader.instances.push( new ChoixpeauScene(t) );
        }
        
        static updateAllModules() {
            this.instances.forEach(m => {
                m.update();
            })
        }
    }
    
    class ThreeJSScene {
        scene;
        camera;
        renderer;
        
        constructor() {
            this.createRenderer();
            this.addLights();
            //this.addHelpers();
            this.addFog();
            this.update();
            this.loadModules();        
        }
        
        addFog() {
            const color = 0x000000;
            const density = 0.02;
            this.scene.fog = new THREE.FogExp2(color, density);
        }
        
        createRenderer() {
            /** Preparing scene */
            const divContainer = document.getElementById('canvas-tree-container');
            const dim = { width: divContainer.offsetWidth, height: divContainer.offsetHeight };
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera( 75, dim.width / dim.height, 0.1, 1000 );
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize( dim.width, dim.height );
            divContainer.appendChild( this.renderer.domElement );
            /** positioning */
            this.camera.position.set(...CAMERA_POSITION);
            this.camera.lookAt(0,0,0);
        }
        
        addLights() {
            // add subtle ambient lighting
            var ambientLight = new THREE.AmbientLight(0x555555);
            this.scene.add(ambientLight);
            
            // add directional light source
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(1, 1, 1).normalize();
            directionalLight.intensity = .8;
            this.scene.add(directionalLight);
            
            /*
            const spotLight = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 10, 0.1 );
            spotLight.position.set( 0, 2, 10 );
            spotLight.castShadow = true;
            
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            
            spotLight.shadow.camera.near = 2;
            spotLight.shadow.camera.far = 10;
            spotLight.shadow.camera.fov = 10;
            this.scene.add( spotLight );*/
        }
        
        addHelpers() {
            /** Axe helper */
            const axesHelper = new THREE.AxesHelper( 90 );
            this.scene.add( axesHelper );
        }
        
        update() {
            /** animate ! */
            const that = this;
            const animate = () => {
                requestAnimationFrame( animate );
                ThreeModulesLoader.updateAllModules();
                that.renderer.render( that.scene, that.camera );
            }
            animate();
        }
        
        loadModules() {
            new ThreeModulesLoader({
                camera: this.camera,
                scene: this.scene
            });
        }
    }
    
    
    $( document ).ready(function() {
        console.log( "Loading 3D scene..." );
        new ThreeJSScene();
        
        
        const toggleFullScreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
        
        $('.fullscreen').click(() => {
            toggleFullScreen();
        })
    });
    