var roadx = [ -105, -55, -5, 45, 95 ];
var roadz = [ -150, -90, -30, 30, 90, 150 ];
//var streetx = roadx[Math.floor(Math.random()*roadx.length)];
//var streetz = roadz[Math.floor(Math.random()*roadz.length)];

var ninety = - Math.PI / 2;
var oneEighty = - Math.PI;
var twoSeventy = Math.PI / 2;
var zero = Math.PI;
var degrees = [ ninety, oneEighty, twoSeventy, zero];
var randomizer = degrees[Math.floor(Math.random()*degrees.length)];
console.log("degree: " + randomizer);

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
      tinyhouseOBJ.rotation.y = oneEighty;
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
      smallhouseOBJ.rotation.y = ninety;
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
      mediumhouseOBJ.rotation.y = twoSeventy;
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
      skyscraper1OBJ.traverse( function ( child ) {
        child.castShadow = true;
      });
      scene.add(skyscraper1OBJ);
    }
  )
})


//skyscraper2
/*var objLoader4 = new THREE.OBJLoader()
materialLoader.load('models/skyscraper2.mtl', function (skyscraper2MAT) {
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
