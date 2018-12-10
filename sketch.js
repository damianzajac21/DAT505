
// GLOBALS ======================================================

var camera, scene, renderer, controls, clock;
var INV_MAX_FPS = 1 / 100, frameDelta = 0;

// SETUP ========================================================
models();
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
   camera.position.y = 10;
   camera.position.z = 10;
   camera.rotation.x = -45 * Math.PI / 180;

   renderer = new THREE.WebGLRenderer({antialias: true});
   renderer.setSize( window.innerWidth, window.innerHeight );
   //renderer.shadowMapEnabled = true;
   document.body.appendChild( renderer.domElement );

   clock = new THREE.Clock();
   controls = new THREE.FirstPersonControls(camera);
   controls.movementSpeed = 100;
   controls.lookSpeed = 0.1;
 }

 function setupWorld() {
   //Create the geometry for the floor
/*   var geo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
   var mat = new THREE.MeshPhongMaterial({color: 0x9db3b5, overdraw: true});
   var floor = new THREE.Mesh(geo, mat);
   floor.rotation.x = -0.5 * Math.PI;
   floor.receiveShadow = true;
   scene.add(floor); */
   var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x114411, depthWrite: false } ) );
   mesh.rotation.x = - Math.PI / 2;
   scene.add( mesh );

   //Create the lighting system and add to the scene
/*   var light = new THREE.DirectionalLight(0xf9f1c2, 1);
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
   scene.add(light); */
   var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
   light.position.set( 0, 20, 0 );
   scene.add( light );

   light = new THREE.DirectionalLight( 0xffffff );
   light.position.set( 0, 20, 10 );
   scene.add( light );
    }

function models() {
  // model
  var loader = new THREE.OBJLoader();
  loader.load(
    'models/tinyhouse.obj', // Replace this with your filename/location
    function (mesh) {
      scene.add(mesh);
      console.log(camera.position);
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
