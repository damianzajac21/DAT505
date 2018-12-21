
// GLOBALS ======================================================
var camera, scene, renderer, controls, clock;
var INV_MAX_FPS = 1 / 100, frameDelta = 0;
/*var cloudCount = 10;
var clouds = [];
var range = 10;*/

// SETUP ========================================================
models();
function setup() {
  document.body.style.backgroundColor = '#d7f0f7';
  setupThreeJS();
  setupWorld();

  requestAnimationFrame(function animate() {
    draw();

    /*var t = clock.elapsedTime * 1;

    for(var i = 0, n = clouds.length; i < n; i++) {
    var cloud = clouds[i];
    cloud.update(t);
  }*/

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
  scene.background = new THREE.Color( 0x99efff );
  scene.fog = new THREE.Fog( 0x99efff, 20, 100 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.y = 3;
  camera.position.z = -10;
  camera.rotation.x = -45 * Math.PI / 180;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  //renderer.shadowMapEnabled = true;
  document.body.appendChild( renderer.domElement );

  clock = new THREE.Clock();
  controls = new THREE.FirstPersonControls(camera);
  controls.lookSpeed = 0.35;
  controls.movementSpeed = 7;
  controls.noFly = true;
  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = 1.5;
  controls.verticalMax = 1.8;
  controls.lon = -150;
  controls.lat = 120;
}

function setupWorld() {
  //Create the geometry for the floor
  var texture = new THREE.TextureLoader().load( 'models/grass.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(500, 500);
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ),
  new THREE.MeshPhongMaterial( { color: 0xaaaaaa,
    map: texture, depthWrite: true, shininess: 0 } ) );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    scene.add( plane );

    scene.add( new THREE.AmbientLight( 0xdddddd ) );
    var light = new THREE.DirectionalLight( 0xdfebff, 1 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    var d = 300;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    light.shadow.camera.far = 1000;
    scene.add( light );

    /*var rand = function() {
    return Math.random() - 0.5;
  };

  for(var i = 0; i < cloudCount; i++) {

  var cloud = new THREE.Cloud();

  cloud.position.set(rand() * range, rand() * range, rand() * range);
  cloud.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);

  var scale = 2.0 + Math.random() * 6;
  cloud.scale.set(scale, scale, scale);

  scene.add(cloud);

  clouds.push(cloud);
}

var cloud = new THREE.Cloud( 0xeeeeee );

cloud.scale.set( 3, 3, 3 );
cloud.position.set( 0, 1, 0 );
cloud.rotation.set( Math.PI * 0.25, Math.PI * 0.5, 0 );

scene.add( cloud ); */

//Create the lighting system and add to the scene
/*   var light = new THREE.DirectionalLight(0xf9f1c2, 1);
light.position.set(500, 1500, 1000);
light.shadowMapWidth = 2048;
light.shadowMapHeight = 2048;
var d = 1000;
light.shadowCameraLeft = d;
light.shadowCameraRight = -d;
light.shadowCameraTop = d;
light.shadowCameraBottom = -d;
light.shadowCameraFar = 2500;
scene.add(light); */
//   var light = new THREE.DirectionalLight( 0xffffff, 1.5/*0xE6E0B8*/ );
/*   light.position.set( 1, 1, 1 );
light.castShadow = true;
light.shadow.mapSize.width = 2000;
light.shadow.mapSize.height = 2000;
light.shadow.camera.left = 50;
light.shadow.camera.right = -50;
light.shadow.camera.top = -50;
light.shadow.camera.bottom = 50;
light.shadow.camera.near = 1;
light.shadow.camera.far = 200;
scene.add( light );

var light2 = new THREE.DirectionalLight( 0xffffff, 0.6 );
light2.position.set( -1, -1, -1 );
scene.add( light2 );
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 20, 10 );
scene.add( light ); */
}

function models() {
  // model
  var loader = new THREE.OBJLoader();
  loader.load(
    'models/tinyhouse.obj', // Replace this with your filename/location
    function (mesh) {
      mesh.scale.set(1.2,1.2,1.2);
      mesh.position.y = 0.62;
      scene.add(mesh);
    }
  )

  var materialLoader = new THREE.MTLLoader()
  materialLoader.load('models/tinyhouse.mtl', function (material) {
    var objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(material)
    objLoader.load(
      'models/tinyhouse.obj',
      function (object) {
        object.scale.set(1.2,1.2,1.2);
        object.position.y = 0.62;
        scene.add(object);
      }
    )
  })
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
