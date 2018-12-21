var ecoPoints = 1;
var civPoints = 1;

navigator.mediaDevices.getUserMedia({ audio: true })
.then(function(stream) {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

  analyser.smoothingTimeConstant = 0.5;
  analyser.fftSize = 1024;

  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
  javascriptNode.onaudioprocess = function() {
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      var values = 0;

      var length = array.length;
      for (var i = 0; i < length; i++) {
        values += (array[i]);
      }

      var average = values / length;
      //console.log("ecoPoints:" + ecoPoints);
      //console.log("civPoints" + civPoints);

      document.getElementById("ecoPoints").innerHTML = "EcoPoints: " + ecoPoints;
      document.getElementById("civPoints").innerHTML = "CivPoints: " + civPoints;
    //console.log(Math.round(average));
    // colorPids(average);
    if (Math.round(average) < 2) {
      ecoPoints = ecoPoints + 1;
    } else if (Math.round(average) > 3) {
      civPoints = civPoints + Math.round(average);
    }
  }
  })
  .catch(function(err) {
    /* handle the error */
});
//ocument.getElementById("ecoPoints").value = ecoPoints;
