var roadx = [ -105, -55, -5, 45, 95 ];
var roadz = [ -150, -90, -30, 30, 90, 150 ];

var materialLoader = new THREE.MTLLoader()
var buildings = [ 'tinyhouse', 'smallhouse', 'mediumhouse', 'bighouse', 'skyscraper2', 'skyscraper3', 'skyscraper4', 'skyscraper5', 'restaurant' ];

setInterval(newBuilding, 5000);

function newBuilding () {
  var firstPositions = {
    posZ: - 5.5,
    posX: Math.random() * (43 - 6) + 6,//- Math.floor((Math.random() * 61)),
    rotY: 0,// Math.PI,
  };
  var secondPositions = {
    posZ: 5.5,
    posX: Math.random() * (43 - 6) + 6,//- Math.floor((Math.random() * 61)),
    rotY: Math.PI,
  };
  var thirdPositions = {
    posZ: Math.random() * (53 - 6) + 6,//- Math.floor((Math.random() * 71)),
    posX: - 5.5,
    rotY: - Math.PI/2,
  };
  var fourthPositions = {
    posZ: Math.random() * (53 - 6) + 6,//- Math.floor((Math.random() * 71)),
    posX: 5.5,
    rotY: Math.PI/2,
  };

  var positions = [ firstPositions, secondPositions, thirdPositions, fourthPositions ];

  var buildingRandomizer = buildings[Math.floor(Math.random()*buildings.length)];

  var randomPos = positions[Math.floor(Math.random()*positions.length)];

  var randomizer = degrees[Math.floor(Math.random()*degrees.length)];

  var streetx = roadx[Math.floor(Math.random()*roadx.length)];
  var streetz = roadz[Math.floor(Math.random()*roadz.length)];

  if (civPoints > 200) {

    var objLoader = new THREE.OBJLoader()
    materialLoader.load('models/' + buildingRandomizer + '.mtl', function (buildingMAT) {
      objLoader.setMaterials(buildingMAT)
      objLoader.load(
        'models/' + buildingRandomizer + '.obj',
        function (buildingOBJ) {
          buildingOBJ.scale.set(2,2,2);
          buildingOBJ.position.z = streetz - randomPos.posZ;
          buildingOBJ.position.x = streetx + randomPos.posX;//4.3; //51; (41 + 4.3);//
          buildingOBJ.rotation.y = randomPos.rotY;
          scene.add(buildingOBJ);
        }
      )
    })

  }
}
