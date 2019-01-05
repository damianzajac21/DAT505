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

  //var pozition = light.position.y;
  //light.position.y = -500;
  /*light.position.y -= 2;
  if (pozition === 497.8837921882747) {
    light.position.y -= 1;
  }*/
  //console.log(light.position.y);

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
    map: texture, depthWrite: true, shininess: 3 } ) );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    plane.traverse( function ( child ) {
      child.receiveShadow = true;
    });
    scene.add( plane );

    var road = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 5 ),
    new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 6 } ) );
    road.rotation.x = - Math.PI / 2;
    road.position.z = -4.3;
    road.position.y = 0.0009;
    scene.add( road );
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
