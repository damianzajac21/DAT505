  var container, stats, gui, mixer, actions, activeAction, previousAction;
  var raycaster, object;// model, face;
  var count = 0;
  var mouse = new THREE.Vector2(), INTERSECTED;
  var objects = [];

  init();

  function init() {

    			// GLOBALS ======================================================

    			var camera, scene, renderer, controls, clock;
    			var INV_MAX_FPS = 1 / 100, frameDelta = 0;

    			// SETUP ========================================================

    			function setup() {
    				document.body.style.backgroundColor = '#d7f0f7';
    				setupThreeJS();
    				setupWorld();

    				requestAnimationFrame(function animate() {
    					draw();

    					frameDelta += clock.getDelta();
    					while (frameDelta >= INV_MAX_FPS) {
    						update(INV_MAX_FPS);
    						frameDelta -= INV_MAX_FPS;
    					}

    					requestAnimationFrame( animate );
    				});
    			}

    			function setupThreeJS() {
    				scene = new THREE.Scene();
    				scene.fog = new THREE.FogExp2(0x9db3b5, 0.002);

    				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    				camera.position.y = 400;
    				camera.position.z = 400;
    				camera.rotation.x = -45 * Math.PI / 180;

    				/* renderer = new THREE.WebGLRenderer({antialias: true});
    				renderer.setSize( window.innerWidth, window.innerHeight );
    				renderer.shadowMapEnabled = true;
    				document.body.appendChild( renderer.domElement ); */

    				clock = new THREE.Clock();
    				controls = new THREE.FirstPersonControls(camera);
    				controls.movementSpeed = 100;
    				controls.lookSpeed = 0.1;
    			}

    			function setupWorld() {
    				//Create the geometry for the floor
    				var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
    				var mat = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true});
    				var floor = new THREE.Mesh(geo, mat);
    				floor.rotation.x = -0.5 * Math.PI;
    				floor.receiveShadow = true;
    				scene.add(floor);

    				//Settings for models and material
    				/*var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    				geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
    				var material = new THREE.MeshPhongMaterial({overdraw: true, color: 0xcccccc});

    				//Geometry to store all buildings of the city
    				var cityGeometry = new THREE.Geometry();
    				for (var i = 0; i < 300; i++) {

    					//Create geometry as a clone
    					var building = new THREE.Mesh(geometry.clone());

    					//Randomize position and scale of the buildings
    					building.position.x = Math.floor( Math.random() * 200 - 100 ) * 4;
    					building.position.z = Math.floor( Math.random() * 200 - 100 ) * 4;
    					building.scale.x  = Math.pow(Math.random(), 2) * 50 + 10;
    					building.scale.y  = Math.pow(Math.random(), 3) * building.scale.x * 8 + 8;
    					building.scale.z  = building.scale.x;

    					//Merge all buildings to one model - cityGeometry
    					THREE.GeometryUtils.merge(cityGeometry, building);
    				}

    				//Mesh of the city
    				var city = new THREE.Mesh(cityGeometry, material);

    				//Cast shadows of the models
    				city.castShadow = true;
    				city.receiveShadow = true;
    				scene.add(city); */

    				//Create the lighting system and add to the scene
    				var light = new THREE.DirectionalLight(0xf9f1c2, 1);
    				light.position.set(500, 1500, 1000);
    				light.castShadow = true;
    				light.shadowMapWidth = 2048;
    				light.shadowMapHeight = 2048;
    				var d = 1000;
    				light.shadowCameraLeft = d;
    				light.shadowCameraRight = -d;
    				light.shadowCameraTop = d;
    				light.shadowCameraBottom = -d;
    				light.shadowCameraFar = 2500;
    				scene.add(light);
    			}

    			// DRAW =========================================================

    			function draw() {
    				renderer.render( scene, camera );
    			}

    			// UPDATE =======================================================

    			function update(delta) {
    				controls.update(delta);
    			}

    			// RUN ==========================================================

    			setup();

	//	raycaster = new THREE.Raycaster();

    /*controls = new THREE.PointerLockControls( camera );
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

      controls.lock();

    }, false );

    controls.addEventListener( 'lock', function () {

      instructions.style.display = 'none';
      blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

      blocker.style.display = 'block';
      instructions.style.display = '';

    } );

    scene.add( controls.getObject() );*/
    // lights
/*
    var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 0, 20, 0 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 20, 10 );
    scene.add( light ); */

    // ground

    var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x114411, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    scene.add( mesh );

  /*  var grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid ); */

    // model

    var loader = new THREE.OBJLoader();
    loader.load(
      'models/tinyhouse.obj', // Replace this with your filename/location
      function (object) {
        scene.add(object);
        object.rotation.y = 90;
      }
    )

    var materialLoader = new THREE.MTLLoader()
    materialLoader.load('models/tinyhouse.mtl', function (material) {
      var objLoader = new THREE.OBJLoader()
      objLoader.setMaterials(material)
      objLoader.load(
        'models/tinyhouse.obj',
        function (object) {
          scene.add(object);
          objects.push(object);
          object.rotation.y = 90;
        }
      )
    })

    //set up state so we know if we are moving forward
  /*  var moveForward = false;
    var moveBackwards = false;
    var moveLeft = false;
    var moveRight = false;

  //define velocity as a vector3
  	var velocity = new THREE.Vector3();
    var prevTime = performance.now();

  //moveforward is true when 'up' or 'w' is pressed
  var onKeyDown = function ( event ) {
					switch ( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = true;
              console.log("onKeyDown! moveForward is now: " + moveForward)
							break;
            case 40: // down
            case 83: // s
              moveBackwards = true;
              console.log("onKeyDown! moveBackwards is now: " + moveBackwards)
              break;
            case 37: // left
            case 65: // a
              moveLeft = true;
              console.log("onKeyDown! moveLeft is now: " + moveLeft)
              break;
            case 39: // right
            case 68: // d
              moveRight = true;
              console.log("onKeyDown! moveRight is now: " + moveRight)
              break;
         }
     }


  //moveforward is false when 'up' or 'w' is not pressed
    var onKeyUp = function ( event ) {
      switch( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = false;
          console.log("onKeyUp! moveForward is now: " + moveForward)
          break;
        case 40: // down
        case 83: // s
          moveBackwards = false;
          console.log("onKeyDown! moveBackwards is now: " + moveBackwards)
          break;
        case 37: // left
        case 65: // a
          moveLeft = false;
          console.log("onKeyDown! moveLeft is now: " + moveLeft)
          break;
        case 39: // right
        case 68: // d
          moveRight = false;
          console.log("onKeyDown! moveRight is now: " + moveRight)
          break;
        }
    }

		//make sure our document knows what functions to call when a key is pressed.
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false ); */


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );

    //time to render the movement every frame.
/*    function render() {
      renderer.render(scene, camera)
      //moving the camera

      //lets make sure we can move camera smoothly based on user's performance.
      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;

      //reset z velocity to be 0 always. But override it if user presses up or w. See next line...
          velocity.z -= velocity.z * 10.0 * delta;
          velocity.x -= velocity.x * 10.0 * delta;
      //if the user pressed 'up' or 'w', set velocity.z to a value > 0.
      if ( moveForward ) velocity.z -= 40.0 * delta;
      if ( moveBackwards ) velocity.z -= -40.0 * delta;
      if ( moveLeft ) velocity.x -= 40.0 * delta;
      if ( moveRight ) velocity.x -= -40.0 * delta;
      //pass velocity as an argument to translateZ and call it on camera.
      camera.translateZ( velocity.z * delta );
      camera.translateX( velocity.x * delta );

      prevTime = time;

      var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

      //raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
      raycaster.setFromCamera( mouse, camera );
      //var intersects = raycaster.intersectObjects( scene.children );
      var intersects = raycaster.intersectObjects( objects, true );

      if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
          if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
          INTERSECTED = intersects[ 0 ].object;
          INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
          INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
      } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
      }
        renderer.render( scene, camera );
    }*/

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

  /*  function draw() {
      count += 0.1;
      requestAnimationFrame( draw );
      render();
    } */

  //  draw();

/*    function animate() {

      var dt = clock.getDelta();

      if ( mixer ) mixer.update( dt );

      requestAnimationFrame( animate );


      stats.update();

    }
      animate(); */
  }
