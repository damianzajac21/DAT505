if ( WEBGL.isWebGLAvailable() === false ) {

  document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}
// GLOBALS ======================================================
var camera, scene, renderer, controls, clock;
var INV_MAX_FPS = 1 / 100, frameDelta = 0;
/*var cloudCount = 10;
var clouds = [];
var range = 10;*/

/*var parameters = {
  distance: 400,
  inclination: 0,
  azimuth: 0.3,
};*/

// SETUP ========================================================
models();
function setup() {
  //document.body.style.backgroundColor = '#d7f0f7';
  setupThreeJS();
  setupWorld();

  requestAnimationFrame(function animate() {
    draw();
    update();
    /*var t = clock.elapsedTime * 1;

    for(var i = 0, n = 10000; i < n; i++) {
  }*/
  param();

  frameDelta += clock.getDelta();
  while (frameDelta >= INV_MAX_FPS) {
    update(INV_MAX_FPS);
    frameDelta -= INV_MAX_FPS;
  }

  requestAnimationFrame( animate );
});
}

function param() {
  parameters.azimuth -= 0.0001;
  parameters.azimuth.onchange = function() {draw()};
  //console.log(parameters.azimuth);
}

function setupThreeJS() {
  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0x99efff );
  /*var sky = new THREE.Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.luminance.value = 1;
  uniforms.mieCoefficient.value = 0.002;
  uniforms.mieDirectionalG.value = 0.7;


  light = new THREE.DirectionalLight( 0xffffff, 0.7 );
  scene.add( light );

  var theta = Math.PI * ( parameters.inclination - 0.5 );
  var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
  light.position.x = parameters.distance * Math.cos( phi );
  light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
  light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
  sky.material.uniforms.sunPosition.value = light.position.copy( light.position );
  //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  light.castShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 10;
  light.shadow.camera.right = 15;
  light.shadow.camera.left = - 15;
  light.shadow.camera.top	= 15;
  light.shadow.camera.bottom = - 15;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  //scene.fog = new THREE.FogExp2( 0x98bbbc, 0.01325 );

  lightR = new THREE.DirectionalLight ( 0xffffff, 0.7 );
  scene.add( lightR );

  lightR.position.x = -1;

  lightL = new THREE.DirectionalLight ( 0xffffff, 0.7 );
  scene.add( lightL );

  lightL.position.x = 1;

  lightB = new THREE.DirectionalLight ( 0xffffff, 0.7 );
  scene.add( lightB );

  lightB.position.z = 1;

  lightF = new THREE.DirectionalLight ( 0xffffff, 0.7 );
  scene.add( lightF );

  lightF.position.z = -1;*/

  //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  /*camera.position.set( 10, 2, 0 );
  camera.rotation.y = 180;*/
  camera.position.y = 3;
  camera.position.z = -10;
  camera.rotation.x = -45 * Math.PI / 180;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
  //renderer.shadowMapEnabled = true;
  document.body.appendChild( renderer.domElement );

  clock = new THREE.Clock();
/*  controls = new THREE.FirstPersonControls(camera);
  controls.lookSpeed = 0.35;
  controls.movementSpeed = 7;
  controls.noFly = true;
  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = 1.5;
  controls.verticalMax = 1.8;
  controls.lon = -150;
  controls.lat = 120;*/
  controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 15;
  controls.maxDistance = 30;
  controls.maxPolarAngle = (Math.PI / 2) - 0.2;

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
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ),
  new THREE.MeshPhongMaterial( { color: 0x555555,
    map: texture, depthWrite: true, shininess: 2 } ) );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    plane.traverse( function ( child ) {
      child.receiveShadow = true;
    });
    scene.add( plane );

    /*scene.add( new THREE.AmbientLight( 0xdddddd ) );
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
    scene.add( light );*/

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
      mesh.position.y = 0;
      mesh.traverse( function ( child ) {
        child.castShadow = true;
      });
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
        object.position.y = 0;
        object.traverse( function ( child ) {
          child.castShadow = true;
        });
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
