if ( WEBGL.isWebGLAvailable() === false ) {

  document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}
// GLOBALS ======================================================
var camera, scene, renderer, controls, clock;
var INV_MAX_FPS = 1 / 100, frameDelta = 0;

var parameters = {
  distance: 400,
  inclination: 0,
  azimuth: -0.01,
};
// SETUP ========================================================
models();
function setup() {
  setupThreeJS();
  setupWorld();

  requestAnimationFrame(function animate() {
    draw();
    update();

  for (i = 0; i < 2; i++) {
    if (light.position.y === 499.8837921882747) { break; }
    light.position.y += i / 50;
  }

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
  scene.fog = new THREE.FogExp2( 0x98bbbc, 0.00125 );
  var sky = new THREE.Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.luminance.value = 1;
  uniforms.mieCoefficient.value = 0.002;
  uniforms.mieDirectionalG.value = 0.7;

  light = new THREE.DirectionalLight( 0xffffff, 0.5 );
  scene.add( light );

  var theta = Math.PI * ( parameters.inclination - 0.5 );
  var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
  light.position.x = parameters.distance * Math.cos( phi );
  light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
  light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
  sky.material.uniforms.sunPosition.value = light.position.copy( light.position );
  light.castShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 10;
  light.shadow.camera.right = 15;
  light.shadow.camera.left = - 15;
  light.shadow.camera.top	= 15;
  light.shadow.camera.bottom = - 15;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;


  lightR = new THREE.DirectionalLight ( 0xffffff, 0.6 );
  scene.add( lightR );

  lightR.position.x = -1;

  lightL = new THREE.DirectionalLight ( 0xffffff, 0.6 );
  scene.add( lightL );

  lightL.position.x = 1;

  lightB = new THREE.DirectionalLight ( 0xffffff, 0.6 );
  scene.add( lightB );

  lightB.position.z = 1;

  lightF = new THREE.DirectionalLight ( 0xffffff, 0.6 );
  scene.add( lightF );

  lightF.position.z = -1;


  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 300 );
  camera.position.y = 3;
  camera.position.z = -10;
  camera.rotation.x = -45 * Math.PI / 180;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );

  clock = new THREE.Clock();
  controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 15;
  controls.maxDistance = 75;
  controls.maxPolarAngle = (Math.PI / 2) - 0.4;

  window.addEventListener( 'resize', onWindowResize, false );
}


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function setupWorld() {
  //Create the geometry for the floor
  var texture = new THREE.TextureLoader().load( 'models/grass.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ),
  new THREE.MeshPhongMaterial( { color: 0x555555,
    map: texture, depthWrite: true, shininess: 8 } ) );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    plane.traverse( function ( child ) {
      child.receiveShadow = true;
    });
    scene.add( plane );

    var roads = [];
    for (var z = -150; z <= 170; z += 60) { // Start from -240 and sequentially add one every 30 pixels
    var road = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
    new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15 } ) );

    road.position.z = z;
    road.position.y = 0.0009;
    road.rotation.x = - Math.PI / 2;

    scene.add(road);
    roads.push(road);
  }

    var roades = [];
    for (var x = -105; x <= 105; x += 50) {
    var roada = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
    new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15 } ) );

    roada.rotation.z = - Math.PI / 2;
    roada.position.y = 0.0009;
    roada.rotation.x = - Math.PI / 2;
    roada.position.x = x;
    scene.add(roada);
    roades.push(roada);
  }
}

function models() {
  // model
  var materialLoader = new THREE.MTLLoader()

  //tinyhouse
  var objLoader = new THREE.OBJLoader()
  materialLoader.load('models/tinyhouse.mtl', function (tinyhouseMAT) {
    objLoader.setMaterials(tinyhouseMAT)
    objLoader.load(
      'models/tinyhouse.obj',
      function (tinyhouseOBJ) {
        tinyhouseOBJ.scale.set(1.2,1.2,1.2);
        tinyhouseOBJ.position.y = 0;
        tinyhouseOBJ.position.z = 25.7;
        tinyhouseOBJ.rotation.y = - Math.PI;
        //console.log(tinyhouseOBJ.rotation.y);
        tinyhouseOBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(tinyhouseOBJ);
      }
    )
  })

  //smallhouse
  var objLoader0 = new THREE.OBJLoader()
  materialLoader.load('models/smallhouse.mtl', function (smallhouseMAT) {
    objLoader0.setMaterials(smallhouseMAT)
    objLoader0.load(
      'models/smallhouse.obj',
      function (smallhouseOBJ) {
        smallhouseOBJ.scale.set(1.2,1.2,1.2);
        smallhouseOBJ.position.y = 0;
        smallhouseOBJ.position.z = 25.7;
        smallhouseOBJ.position.x = 5;
        smallhouseOBJ.rotation.y = - Math.PI;
        //console.log(smallhouseOBJ.rotation.y);
        smallhouseOBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(smallhouseOBJ);
      }
    )
  })

  //mediumhouse
  var objLoader1 = new THREE.OBJLoader()
  materialLoader.load('models/mediumhouse.mtl', function (mediumhouseMAT) {
    objLoader1.setMaterials(mediumhouseMAT)
    objLoader1.load(
      'models/mediumhouse.obj',
      function (mediumhouseOBJ) {
        mediumhouseOBJ.scale.set(1.2,1.2,1.2);
        mediumhouseOBJ.position.y = 0;
        mediumhouseOBJ.position.z = 34.3;
        //mediumhouseOBJ.rotation.y = - Math.PI;
        //console.log(mediumhouseOBJ.rotation.y);
        mediumhouseOBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(mediumhouseOBJ);
      }
    )
  })


  //bighouse
  var objLoader2 = new THREE.OBJLoader()
  materialLoader.load('models/bighouse.mtl', function (bighouseMAT) {
    objLoader2.setMaterials(bighouseMAT)
    objLoader2.load(
      'models/bighouse.obj',
      function (bighouseOBJ) {
        bighouseOBJ.scale.set(1.2,1.2,1.2);
        bighouseOBJ.position.y = 0;
        bighouseOBJ.position.z = 34.3;
        bighouseOBJ.position.x = 10;
        //bighouseOBJ.rotation.y = - Math.PI;
        //console.log(bighouseOBJ.rotation.y);
        bighouseOBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(bighouseOBJ);
      }
    )
  })

  //skyscraper1
  var objLoader3 = new THREE.OBJLoader()
  materialLoader.load('models/skyscraper1.mtl', function (skyscraper1MAT) {
    objLoader3.setMaterials(skyscraper1MAT)
    objLoader3.load(
      'models/skyscraper1.obj',
      function (skyscraper1OBJ) {
        skyscraper1OBJ.scale.set(1.2,1.2,1.2);
        skyscraper1OBJ.position.y = 0;
        skyscraper1OBJ.position.z = 39.45;
        skyscraper1OBJ.position.x = 30;
        //skyscraper1OBJ.rotation.y = - Math.PI;
        //console.log(skyscraper1OBJ.rotation.y);
        skyscraper1OBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(skyscraper1OBJ);
      }
    )
  })


  //skyscraper2
  var objLoader4 = new THREE.OBJLoader()
  /*materialLoader.load('models/skyscraper2.mtl', function (skyscraper2MAT) {
    objLoader4.setMaterials(skyscraper2MAT)
    objLoader4.load(
      'models/skyscraper2.obj',
      function (skyscraper2OBJ) {
        skyscraper2OBJ.scale.set(1.2,1.2,1.2);
        skyscraper2OBJ.position.y = 0;
        skyscraper2OBJ.position.z = 23.8;
        skyscraper2OBJ.position.x = 20;
        skyscraper2OBJ.rotation.y = - Math.PI;
        //console.log(skyscraper2OBJ.rotation.y);
        skyscraper2OBJ.traverse( function ( child ) {
          child.castShadow = true;
        });
        scene.add(skyscraper2OBJ);
      }
    )
  })*/
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
