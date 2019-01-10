if ( WEBGL.isWebGLAvailable() === false ) {
  document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

//SCALES THE MATH.SIN OF THE SUN//
const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// GLOBALS ======================================================
var camera, scene, renderer, controls, clock, road, roada;
var INV_MAX_FPS = 1 / 100, frameDelta = 0;
var ninety = - Math.PI / 2;

//TIME DEVIDED SCALED DOWN SO THE SUN MOVES SLOWER//
var time = Date.now() * 0.00002;
var newMotion = scale(Math.sin(time * 1) * 15, -13, 2, -50, 55);

//PARAMETERS FOR THE LOCATION OF THE SUN USING THE SKY LIBRARY//
var parameters = {
  distance: 400,
  inclination: 0,
  azimuth: -0.01,
};

// SETUP ========================================================
function setup() {
  setupThreeJS();
  setupWorld();

  requestAnimationFrame(function animate() {
    draw();
    update();
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

  //SKY PLUG-IN, ADD SUN AND CHANGES THE SKY COLOUR//
  var sky = new THREE.Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2; //COLOUR
  uniforms.luminance.value = 1; //BRIGHTNESS OF THE SUN (NOT THE LIGHT)
  uniforms.mieCoefficient.value = 0.002;
  uniforms.mieDirectionalG.value = 0.7;

  light = new THREE.DirectionalLight( 0xffffff, 1 );
  scene.add( light );

  var theta = Math.PI * ( parameters.inclination - 0.5 );
  var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
  light.position.x = parameters.distance * Math.cos( phi );
  light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
  light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
  sky.material.uniforms.sunPosition.value = light.position.copy( light.position );

  //IGNORE THIS//
  light.castShadow = true;
  light.receiveShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 10;
  light.shadow.camera.right = 15;
  light.shadow.camera.left = - 15;
  light.shadow.camera.top	= 15;
  light.shadow.camera.bottom = - 15;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;


  //ADDITIONAL LIGHT SO OTHER SIDES ARE ALSO VISIBLE//
  lightR = new THREE.DirectionalLight ( 0xffffff, 0.5 );
  scene.add( lightR );
  lightR.position.x = -1;
  lightL = new THREE.DirectionalLight ( 0xffffff, 0.5 );
  scene.add( lightL );
  lightL.position.x = 1;
  lightB = new THREE.DirectionalLight ( 0xffffff, 0.5 );
  scene.add( lightB );
  lightB.position.z = 1;
  lightF = new THREE.DirectionalLight ( 0xffffff, 0.5 );
  scene.add( lightF );
  lightF.position.z = -1;

  //CAMERA, FOV AT 60, WITH ENOUGH DRAW DISTANCE//
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 400 );
  camera.position.y = 13.797620797246811;
  camera.position.z = 28.60457175588346;
  camera.rotation.x = -45 * Math.PI / 180;
  camera.position.x = 39.16167102057085;
  camera.rotation.z = 1.4735220064454397;
  camera.rotation.y = 1.1353644437747186;

  //RENDERS THE SCENE//
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  //ORBIT CONTROLS
  clock = new THREE.Clock();
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 30;
  controls.maxDistance = 130;
  controls.maxPolarAngle = (Math.PI / 2) - 0.4;

  window.addEventListener( 'resize', onWindowResize, false );
}

//FUNCTION THAT CHANGES THE RENDERER SIZE WHEN WINDOW IS RESIZED
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function setupWorld() {
  //Create the geometry for the grass
  var texture = new THREE.TextureLoader().load( 'models/grass.jpg' );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ),
  new THREE.MeshPhongMaterial( { color: 0x555555,
    map: texture, depthWrite: true, shininess: 8, side: THREE.DoubleSide } ) );
    plane.rotation.x = ninety;
    plane.receiveShadow = true;
    plane.traverse( function ( child ) {
      child.receiveShadow = true;
    });
    scene.add( plane );

    //Array for roads
    var roads = [];
    for (var z = -150; z <= 170; z += 60) { // Start from -150 and sequentially add one every 60 pixels
    road = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
    new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

    road.position.z = z;
    road.position.y = 0.0009;
    road.rotation.x = ninety;

    scene.add(road);
    roads.push(road);
  }

  //Arrays for left-side pavements
  var pavementsL = [];
  for (var z = -147.8; z <= 187.8; z += 60) {
    for (var x = -130; x <= 120; x += 50) {
    var pavementL = new THREE.Mesh( new THREE.PlaneBufferGeometry( 46.3, 0.66 ),
      new THREE.MeshPhongMaterial ( { color: 0x666666,
        depthWrite: true, shininess: 10, side: THREE.DoubleSide } ) );

  pavementL.position.z = z;
  pavementL.position.x = 20;
  pavementL.position.y = 0.0015;
  pavementL.rotation.x = ninety;
  pavementL.position.x = x;

  scene.add(pavementL);
  pavementsL.push(pavementL);
}
}

//array for right-side pavements
  var pavementsR = [];
  for (var z = -152.2; z <= 192.2; z += 60) {
    for (var x = -130; x <= 120; x += 50) {
    var pavementR = new THREE.Mesh( new THREE.PlaneBufferGeometry( 46.3, 0.66 ),
    new THREE.MeshPhongMaterial ( { color: 0x666666,
      depthWrite: true, shininess: 10, side: THREE.DoubleSide } ) );

  pavementR.position.z = z;
  pavementR.position.x = 20;
  pavementR.position.y = 0.0015;
  pavementR.rotation.x = ninety;
  pavementR.position.x = x;

  scene.add(pavementR);
  pavementsR.push(pavementR);
}
}

//array for another set of roads
var roades = [];
for (var x = -105; x <= 105; x += 50) {
  roada = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
  new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

    roada.rotation.z = ninety;
    roada.position.y = 0.0009;
    roada.rotation.x = ninety;
    roada.position.x = x;
    scene.add(roada);
    roades.push(roada);
    //console.log(roada.position.x);
  }

//array of left-side pavements for another set of roads
  var pavements1 = [];
  for (var x = -107.2; x <= 107.2; x += 50) {
    for (var z = -120; z <= 140; z += 60) {
    var pavement1 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 56.3, 0.66 ),
    new THREE.MeshPhongMaterial ( { color: 0x666666,
      depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

      pavement1.rotation.z = ninety;
      pavement1.position.x = x;
      pavement1.position.y = 0.0015;
      pavement1.rotation.x = ninety;
      pavement1.position.z = z;

      scene.add(pavement1);
      pavements1.push(pavement1);
    }
}
//array of right-side pavements for another set of roads
    var pavements2 = [];
    for (var x = -102.8; x <= 102.8; x += 50) {
      for (var z = -120; z <= 140; z += 60) {
      var pavement2 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 56.3, 0.66 ),
      new THREE.MeshPhongMaterial ( { color: 0x666666,
        depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

        pavement2.rotation.z = ninety;
        pavement2.position.x = x;
        pavement2.position.y = 0.0015;
        pavement2.rotation.x = ninety;
        pavement2.position.z = z;

        scene.add(pavement2);
        pavements2.push(pavement2);
      }
    }
}

// DRAW =========================================================
function draw() {

//changes the position of the sun and light
    light.position.y = newMotion;
    renderer.render( scene, camera );
}

// UPDATE =======================================================
function update(delta) {
  //updates controls in real time
  controls.update(delta);
}

// RUN ==========================================================
setup();
