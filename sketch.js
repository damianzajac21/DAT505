

  if ( WEBGL.isWebGLAvailable() === false ) {

    document.body.appendChild( WEBGL.getWebGLErrorMessage() );

  }

  var container, stats, clock, gui, mixer, actions, activeAction, previousAction;
  var camera, scene, renderer, controls;// model, face;
  var count = 0;

  init();

  function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
    camera.position.set( -5, 2, 20 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x99efff );
    scene.fog = new THREE.Fog( 0x99efff, 20, 100 );

    clock = new THREE.Clock();

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

    var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 0, 20, 0 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 20, 10 );
    scene.add( light );

    // ground

    var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x114411, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    scene.add( mesh );

    var grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

    // model

    var loader = new THREE.OBJLoader();
    loader.load(
      'models/tinyhouse.obj', // Replace this with your filename/location
      function (mesh) {
        scene.add(mesh);
        mesh.rotation.y = 90;
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
          object.rotation.y = 90;
        }
      )
    })

    //set up state so we know if we are moving forward
    var moveForward = false;
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
    document.addEventListener( 'keyup', onKeyUp, false );


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
    function render() {
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

    }

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function draw() {
      count += 0.1;
      requestAnimationFrame( draw );
      render();
    }

    draw();

    function animate() {

      var dt = clock.getDelta();

      if ( mixer ) mixer.update( dt );

      requestAnimationFrame( animate );

      renderer.render( scene, camera );

      stats.update();

    }
      animate();
  }
