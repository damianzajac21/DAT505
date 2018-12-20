
if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia ({audio: true})
    .then(function(stream) {
        var audioCtx = new AudioContext();
        var source = audioCtx.createMediaStreamSource(stream);
})
}
//https://webaudio.github.io/web-audio-api/#dom-analysernode-getfloatfrequencydata
