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

var road;
var roada;
var roadx = [ -105, -55, -5, 45, 95 ];
//var streetx = roadx[Math.floor(Math.random()*roadx.length)];
var roadz = [ -150, -90, -30, 30, 90, 150 ];
//var streetz = roadz[Math.floor(Math.random()*roadz.length)];
// SETUP ========================================================
models();
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
  //scene.fog = new THREE.FogExp2( 0x98bbbc, 0.00055 );
  var sky = new THREE.Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.luminance.value = 1;
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


  lightR = new THREE.DirectionalLight ( 0xffffff, 0.4 );
  scene.add( lightR );

  lightR.position.x = -1;

  lightL = new THREE.DirectionalLight ( 0xffffff, 0.4 );
  scene.add( lightL );

  lightL.position.x = 1;

  lightB = new THREE.DirectionalLight ( 0xffffff, 0.4 );
  scene.add( lightB );

  lightB.position.z = 1;

  lightF = new THREE.DirectionalLight ( 0xffffff, 0.4 );
  scene.add( lightF );

  lightF.position.z = -1;


  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 400 );
  camera.position.y = 13.797620797246811;
  camera.position.z = 28.60457175588346;
  camera.rotation.x = -45 * Math.PI / 180; //-1.80097995101144
  camera.position.x = 39.16167102057085;
  camera.rotation.z = 1.4735220064454397;
  camera.rotation.y = 1.1353644437747186;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    map: texture, depthWrite: true, shininess: 8, side: THREE.DoubleSide } ) );
    plane.rotation.x = - Math.PI / 2;
    plane.receiveShadow = true;
    plane.traverse( function ( child ) {
      child.receiveShadow = true;
    });
    scene.add( plane );

    var roads = [];
    for (var z = -150; z <= 170; z += 60) { // Start from -240 and sequentially add one every 30 pixels
    road = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
    new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

    road.position.z = z;
    road.position.y = 0.0009;
    road.rotation.x = - Math.PI / 2;
    //console.log(road.position.z);

    scene.add(road);
    roads.push(road);
  }

  var pavementsL = [];
  for (var z = -147.8; z <= 187.8; z += 60) { // Start from -240 and sequentially add one every 30 pixels
    for (var x = -130; x <= 120; x += 50) {
    var pavementL = new THREE.Mesh( new THREE.PlaneBufferGeometry( 46.3, 0.66 ),
      new THREE.MeshPhongMaterial ( { color: 0x666666,
        depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

  pavementL.position.z = z;
  pavementL.position.x = 20;
  pavementL.position.y = 0.0015;
  pavementL.rotation.x = - Math.PI / 2;
  pavementL.position.x = x;

  scene.add(pavementL);
  pavementsL.push(pavementL);
}
}

  var pavementsR = [];
  for (var z = -152.2; z <= 192.2; z += 60) { // Start from -240 and sequentially add one every 30 pixels
    for (var x = -130; x <= 120; x += 50) {
    var pavementR = new THREE.Mesh( new THREE.PlaneBufferGeometry( 46.3, 0.66 ),
    new THREE.MeshPhongMaterial ( { color: 0x666666,
      depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

  pavementR.position.z = z;
  pavementR.position.x = 20;
  pavementR.position.y = 0.0015;
  pavementR.rotation.x = - Math.PI / 2;
  pavementR.position.x = x;

  scene.add(pavementR);
  pavementsR.push(pavementR);
}
}

var roades = [];
for (var x = -105; x <= 105; x += 50) {
  roada = new THREE.Mesh( new THREE.PlaneBufferGeometry( 400, 5 ),
  new THREE.MeshPhongMaterial ( { color: 0x111111,
    depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

    roada.rotation.z = - Math.PI / 2;
    roada.position.y = 0.0009;
    roada.rotation.x = - Math.PI / 2;
    roada.position.x = x;
    scene.add(roada);
    roades.push(roada);
    //console.log(roada.position.x);
  }

  var pavements1 = [];
  for (var x = -107.2; x <= 107.2; x += 50) { // Start from -240 and sequentially add one every 30 pixels
    for (var z = -120; z <= 140; z += 60) {
    var pavement1 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 56.3, 0.66 ),
    new THREE.MeshPhongMaterial ( { color: 0x666666,
      depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

      pavement1.rotation.z = - Math.PI / 2;
      pavement1.position.x = x;
      pavement1.position.y = 0.0015;
      pavement1.rotation.x = - Math.PI / 2;
      pavement1.position.z = z;

      scene.add(pavement1);
      pavements1.push(pavement1);
    }
}
    var pavements2 = [];
    for (var x = -102.8; x <= 102.8; x += 50) {
      for (var z = -120; z <= 140; z += 60) {
      var pavement2 = new THREE.Mesh( new THREE.PlaneBufferGeometry( 56.3, 0.66 ),
      new THREE.MeshPhongMaterial ( { color: 0x666666,
        depthWrite: true, shininess: 15, side: THREE.DoubleSide } ) );

        pavement2.rotation.z = - Math.PI / 2;
        pavement2.position.x = x;
        pavement2.position.y = 0.0015;
        pavement2.rotation.x = - Math.PI / 2;
        pavement2.position.z = z;

        scene.add(pavement2);
        pavements2.push(pavement2);
      }
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
        var streetx = roadx[Math.floor(Math.random()*roadx.length)];
        var streetz = roadz[Math.floor(Math.random()*roadz.length)];
        tinyhouseOBJ.scale.set(1.2,1.2,1.2);
        tinyhouseOBJ.position.y = 0;
        tinyhouseOBJ.position.z = streetz - 4.3;
        tinyhouseOBJ.position.x = streetx - Math.floor((Math.random() * 41) + 4.3);//4.3; //51; (41 + 4.3);//
        tinyhouseOBJ.rotation.y = - Math.PI;
        //console.log(roada.position.x);
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
        var streetx = roadx[Math.floor(Math.random()*roadx.length)];
        var streetz = roadz[Math.floor(Math.random()*roadz.length)];
        smallhouseOBJ.scale.set(1.2,1.2,1.2);
        smallhouseOBJ.position.y = 0;
        smallhouseOBJ.position.z = streetz - Math.floor((Math.random() * 51) + 4.3);
        smallhouseOBJ.position.x = streetx - 4.3; //Math.floor((Math.random() * 41) - 4.3);
        smallhouseOBJ.rotation.y = - Math.PI / 2;
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
        var streetx = roadx[Math.floor(Math.random()*roadx.length)];
        var streetz = roadz[Math.floor(Math.random()*roadz.length)];
        mediumhouseOBJ.scale.set(1.2,1.2,1.2);
        mediumhouseOBJ.position.y = 0;
        mediumhouseOBJ.position.z = streetz - Math.floor((Math.random() * 51) - 6.3);
        mediumhouseOBJ.position.x = streetx + 4.3; //Math.floor((Math.random() * 41) + 4.3);
        mediumhouseOBJ.rotation.y = Math.PI / 2;
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
        var streetx = roadx[Math.floor(Math.random()*roadx.length)];
        var streetz = roadz[Math.floor(Math.random()*roadz.length)];
        bighouseOBJ.scale.set(1.2,1.2,1.2);
        bighouseOBJ.position.y = 0;
        bighouseOBJ.position.z = streetz + 4.3;
        bighouseOBJ.position.x = streetx - Math.floor((Math.random() * 40) + 5.3);
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
  var time = Date.now() * 0.00002;
  var daytime = new Map();
  //var hours = daytime.map(())
  //for (var i = 0; i < 1; i++) {

  var newMotion = scale(Math.sin(time * 1) * 15, -13, 2, -50, 55);

    light.position.y = newMotion;
    //console.log(newMotion);
    renderer.render( scene, camera );
  //}
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// UPDATE =======================================================
function update(delta) {
  controls.update(delta);
}

// RUN ==========================================================
setup();
