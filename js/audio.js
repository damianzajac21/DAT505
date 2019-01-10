//GLOBAL VARIABLES//
var ecoPoints = 1;
var civPoints = 1;

//GET MEDIA (ONLY MICROPHONE) FROM THE USER, A POP-UP WILL APPEAR IN THE BROWSER ASKING FOR PERMISSION//
navigator.mediaDevices.getUserMedia({ audio: true })
.then(function(stream) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

  //SETTING UP THE ANALYSER FOR THE SOUND//
  analyser.smoothingTimeConstant = 0.2;
  analyser.fftSize = 1024;

  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);

  //THIS CODE ANALYSES THE SOUND'S FREQUENCY SO IT WILL CONVERT THE VALUES TO HOW LOUD THE SOUND PICKED UP BY THE MICROPHONE IS//
  javascriptNode.onaudioprocess = function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += (array[i]);
      }

      var average = values / length;

      //DISPLAY THE POINTS AQUIRED THROUGH NOISE OR SILENCE//
      document.getElementById("ecoPoints").innerHTML = "EcoPoints: " + ecoPoints;
      document.getElementById("civPoints").innerHTML = "CivPoints: " + civPoints;

      //SCALE OF VOLUME IS ANALYSED BETWEEN 0 AND 100//
      //HERE BELOW WE SEE THAT WHEN THE LOUDNESS IS BELOW 20% ECOPOINTS WILL BE INCREASED
      //AND WHEN IT IS ABOVE 20% CIVPOINTS WILL INCREASE//
    if (Math.round(average) < 20 || ecoPoints < 2) {
      ecoPoints = ecoPoints + 1;
    } else if (Math.round(average) > 20) {
      ecoPoints = ecoPoints - 1;
    }
    if (Math.round(average) > 20 || civPoints < 2) {
      civPoints = civPoints + 1;
    } else if (Math.round(average) < 20) {
      civPoints = civPoints - 1;
    }
  }
  })
  .catch(function(err) {
    /* handle the error */
});
