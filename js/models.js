//LOCATIONS OF THE ROADS//
var roadx = [ -105, -55, -5, 45, 95 ];
var roadz = [ -150, -90, -30, 30, 90, 150 ];

var materialLoader = new THREE.MTLLoader()

//DECLARING ARRAYS THAT WILL LATER BE USED TO PICK AT RANDOM WHEN SPAWNING AN OBJECT//
var buildings = [ 'tinyhouse', 'smallhouse', 'mediumhouse', 'bighouse'];
var houseColors = [ 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'White', 'Red'];
var restColors = [ 'Blue', 'Brown', 'Red', 'Yellow' ]; //RESTAURANT COLOURS
var skyscrapers = [ 'skyscraper1', 'skyscraper2', 'skyscraper3', 'skyscraper4', 'skyscraper5' ];
var nums = [ '1', '2', '3', '4']; //TREES

//HOW OFTEN EACH FUNCTION SHOULD BE CALLED (7000 = 7 SECONDS)//
setInterval(newHouse, 7000);
setInterval(newRestaurant, 20000);
setInterval(newScraper, 60000);
setInterval(newTree, 2000);

function newHouse () {
  //LOCATIONS WHERE BUILDINGS CAN BE PLACED - ALWAYS FACING THE ROAD//
  var firstPositions = {
    posZ: - 5.5,
    posX: Math.random() * (43 - 6) + 6,
    rotY: 0,
  };
  var secondPositions = {
    posZ: 5.5,
    posX: Math.random() * (43 - 6) + 6,
    rotY: Math.PI,
  };
  var thirdPositions = {
    posZ: Math.random() * (53 - 6) + 6,
    posX: - 5.5,
    rotY: - Math.PI/2,
  };
  var fourthPositions = {
    posZ: Math.random() * (53 - 6) + 6,
    posX: 5.5,
    rotY: Math.PI/2,
  };

  //PICKS A RANDOM LOCATION//
  var positions = [ firstPositions, secondPositions, thirdPositions, fourthPositions ];
  var randomPos = positions[Math.floor(Math.random()*positions.length)];

  //PICKS A RANDOM HOUSE AND ITS COLOUR//
  var buildingRandomizer = buildings[Math.floor(Math.random()*buildings.length)];
  var colorRandomizer = houseColors[Math.floor(Math.random()*houseColors.length)];

//PICKS A RANDOM LOCATION ON THE STREET//
  var streetx = roadx[Math.floor(Math.random()*roadx.length)];
  var streetz = roadz[Math.floor(Math.random()*roadz.length)];

//IF ATLEAST 50 CIVPOINTS ACCUMULATED THEN PLACE A RANDOM HOUSE WITH A RANDOM COLOUR AT A RANDOM LOCATION//
  if (civPoints > 50) {

    var objLoader = new THREE.OBJLoader()
    materialLoader.load('models/' + buildingRandomizer + colorRandomizer + '.mtl', function (buildingMAT) {
      objLoader.setMaterials(buildingMAT)
      objLoader.load(
        'models/' + buildingRandomizer + '.obj',
        function (buildingOBJ) {
          buildingOBJ.scale.set(2,2,2);
          buildingOBJ.position.z = streetz - randomPos.posZ;
          buildingOBJ.position.x = streetx + randomPos.posX;
          buildingOBJ.rotation.y = randomPos.rotY;
          scene.add(buildingOBJ);
        }
      )
    })

  }
}

function newRestaurant () {
  //SAME AS ABOVE, BUT FOR RESTAURANTS//
  var firstPositions = {
    posZ: - 5.5,
    posX: Math.random() * (40 - 13) + 13,
    rotY: 0,
  };
  var secondPositions = {
    posZ: 5.5,
    posX: Math.random() * (40 - 13) + 13,
    rotY: Math.PI,
  };
  var thirdPositions = {
    posZ: Math.random() * (50 - 13) + 13,
    posX: - 5.5,
    rotY: - Math.PI/2,
  };
  var fourthPositions = {
    posZ: Math.random() * (50 - 13) + 13,
    posX: 5.5,
    rotY: Math.PI/2,
  };

  var positions = [ firstPositions, secondPositions, thirdPositions, fourthPositions ];
  var randomPos = positions[Math.floor(Math.random()*positions.length)];

  var colorRandomizer2 = restColors[Math.floor(Math.random()*restColors.length)];

  var streetx = roadx[Math.floor(Math.random()*roadx.length)];
  var streetz = roadz[Math.floor(Math.random()*roadz.length)];

  if (civPoints > 100) {

    var objLoader1 = new THREE.OBJLoader()
    materialLoader.load('models/restaurant' + colorRandomizer2 + '.mtl', function (buildingMAT1) {
      objLoader1.setMaterials(buildingMAT1)
      objLoader1.load(
        'models/restaurant.obj',
        function (buildingOBJ1) {
          buildingOBJ1.scale.set(2,2,2);
          buildingOBJ1.position.z = streetz - randomPos.posZ;
          buildingOBJ1.position.x = streetx + randomPos.posX;
          buildingOBJ1.rotation.y = randomPos.rotY;
          scene.add(buildingOBJ1);
        }
      )
    })

  }
}

function newScraper () {
  //SAME AS ABOVE BUT FOR SKYSCRAPERS
  var firstPositions = {
    posZ: - 5.5,
    posX: Math.random() * (43 - 6) + 6,
    rotY: 0,
  };
  var secondPositions = {
    posZ: 5.5,
    posX: Math.random() * (43 - 6) + 6,
    rotY: Math.PI,
  };
  var thirdPositions = {
    posZ: Math.random() * (53 - 6) + 6,
    posX: - 5.5,
    rotY: - Math.PI/2,
  };
  var fourthPositions = {
    posZ: Math.random() * (53 - 6) + 6,
    posX: 5.5,
    rotY: Math.PI/2,
  };

  var positions = [ firstPositions, secondPositions, thirdPositions, fourthPositions ];

  var randomPos = positions[Math.floor(Math.random()*positions.length)];

  var streetx = roadx[Math.floor(Math.random()*roadx.length)];
  var streetz = roadz[Math.floor(Math.random()*roadz.length)];

  if (civPoints > 300) {

    var objLoader2 = new THREE.OBJLoader()
    materialLoader.load('models/' + randomScraper + '.mtl', function (buildingMAT2) {
      objLoader2.setMaterials(buildingMAT2)
      objLoader2.load(
        'models/' + randomScraper + '.obj',
        function (buildingOBJ2) {
          buildingOBJ2.scale.set(2,2,2);
          buildingOBJ2.position.z = streetz - randomPos.posZ;
          buildingOBJ2.position.x = streetx + randomPos.posX;//4.3; //51; (41 + 4.3);//
          buildingOBJ2.rotation.y = randomPos.rotY;
          scene.add(buildingOBJ2);
        }
      )
    })

  }
}

function newTree () {
  //SAME AS ABOVE BUT FOR TREES//
  var firstPositions = {
    posZ: - 17.5,
    posX: Math.random() * (38 - 11) + 11,
    rotY: 0,
  };
  var secondPositions = {
    posZ: 17.5,
    posX: Math.random() * (38 - 11) + 11,
    rotY: Math.PI,
  };
  var thirdPositions = {
    posZ: Math.random() * (48 - 11) + 11,
    posX: - 17.5,
    rotY: - Math.PI/2,
  };
  var fourthPositions = {
    posZ: Math.random() * (48 - 11) + 11,
    posX: 17.5,
    rotY: Math.PI/2,
  };

  var positions = [ firstPositions, secondPositions, thirdPositions, fourthPositions ];
  var randomPos = positions[Math.floor(Math.random()*positions.length)];

  var randomTree = nums[Math.floor(Math.random()*nums.length)];

  var streetx = roadx[Math.floor(Math.random()*roadx.length)];
  var streetz = roadz[Math.floor(Math.random()*roadz.length)];

  if (ecoPoints > 50) {

    var objLoader3 = new THREE.OBJLoader()
    materialLoader.load('models/tree' + randomTree + '.mtl', function (buildingMAT3) {
      objLoader3.setMaterials(buildingMAT3)
      objLoader3.load(
        'models/tree' + randomTree + '.obj',
        function (buildingOBJ3) {
          buildingOBJ3.scale.set(2,2,2);
          buildingOBJ3.position.z = streetz - randomPos.posZ;
          buildingOBJ3.position.x = streetx + randomPos.posX;//4.3; //51; (41 + 4.3);//
          buildingOBJ3.rotation.y = randomPos.rotY;
          scene.add(buildingOBJ3);
        }
      )
    })

  }
}
