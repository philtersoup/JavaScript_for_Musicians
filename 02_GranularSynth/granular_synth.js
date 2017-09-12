//Granular Synth Prototype for Aesthesis
//philterSoup 2017

var ac;
var buffer;
var loadState = false;

var playRate, dur = 2;
var voices = [];
var maxVoice = 50;

var delay;

var bgCol = 127;

var fft, grainMix;


function getData() {

  // source = ac.createBufferSource();
  var request = new XMLHttpRequest();

  request.open('GET', 'Ambient_track_2.mp3', true);

  request.responseType = 'arraybuffer';


  request.onload = function() {
  var audioData = request.response;

  ac.decodeAudioData(audioData, function(buf){
    buffer = buf;
    loadState = true;
    bgCol = 3;
    loop();
    // initGrains();
  },

      function(e){ console.log("Error with decoding audio data" + e.err); });

  }

  request.send();
}

function setup() {

  createCanvas(windowWidth,windowHeight);
  ac = getAudioContext();

  grainMix = new p5.Gain();
  grainMix.connect();

  getData();

  playRate = mouseY/height;
  // reverb = new p5.Reverb();
  // reverb.process(grainMix, 5, 5);
  // reverb.drywet(0.35);

  // delay = new p5.Delay();
  // delay.setType('pingPong');
  //
  // delay.process(grainMix,.65,.50,2000);
  // delay.drywet(0.60);

  textSize(32);
  textAlign('center');
  text("Loading...", width/2, height/2);

  fft = new p5.FFT();
  fft.setInput(grainMix);
  noLoop();
  // frameRate(30);
}

function draw(){

  background(bgCol,100);

  playRate = 1 - mouseY/height;

  drawCircles();
}
function drawCircles(){

  var spectrum = fft.analyze();
  for(var i = 0; i < spectrum.length; i+=20){
  noFill();
  stroke(spectrum[i]);
  ellipse(mouseX + spectrum[i]/120,mouseY+spectrum[i]/120 ,spectrum[i] * 2,spectrum[i]* 2);
  }
}


function Voice(){
//Voice Handler Class
}

Voice.prototype.playGrain = function(){
  this.grains = [];
  this.grainCount = 0;

  var that = this;

  this.play = function(){

    var grain = new Grain(mouseY/height * buffer.duration, mouseX/width * dur);

    that.grains[that.grainCount] = grain;
    that.grainCount += 1;

    if(that.grainCount>10){
      that.grainCount = 0;
    }

    that.timeOut = setTimeout(that.play,75);
  }
  if(loadState)
  this.play();
}

Voice.prototype.stopGrain = function(){
  clearTimeout(this.timeOut);
}

function Grain(offset,duration){
//Grain Class
  // console.log('hello');

  var that = this;
  this.now = ac.currentTime;
  this.seed = Math.random();
  this.amp = 0.65;
  this.offset = offset;
  this.duration = duration;

  this.sound = ac.createBufferSource();
  this.sound.buffer = buffer;
  this.sound.playbackRate.value = this.seed * 4* playRate;
  this.sound.disconnect();

  this.gain = ac.createGain();

  this.sound.connect(this.gain);
  this.gain.connect(grainMix);

  this.sound.start(this.now,this.offset, this.duration);
  this.gain.gain.setValueAtTime(0.0, this.now);
	this.gain.gain.linearRampToValueAtTime(this.amp,this.now + 4 * this.seed);
	this.gain.gain.linearRampToValueAtTime(0,this.now + this.duration  );

  this.sound.stop(this.now + this.duration + 0.1);
	var tms = this.duration * 1000;
	setTimeout(function(){
		that.gain.disconnect();
	},tms + 200);

}

function mousePressed(){
  var v = new Voice();
  v.playGrain();
  voices.push(v);
  return false;
}

function mouseReleased(){
  for(var i = 0; i < voices.length ; i++){
    voices[i].stopGrain();
    voices.splice(i);
  }
}
