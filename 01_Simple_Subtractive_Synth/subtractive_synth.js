var Oscillators_gui = {
  osc1_Level: 0.45,
  osc2_Level: 0.3,
  osc3_Level: 0.2
};

var Filter_gui = {
  freq: 6000,
  res: 20,
  type: 'lowpass'
}

var Oscillators, OscGain, Filt, MasterGain;
var fft;

function setup() {

  Oscillators = [];
  createCanvas(windowWidth, windowHeight);

  var gui = new dat.GUI();
  var oscG = gui.addFolder('Oscillators');
  oscG.add(Oscillators_gui, 'osc1_Level', 0, 1).name('Square');
  oscG.add(Oscillators_gui, 'osc2_Level', 0, 1).name('Sawtooth');
  oscG.add(Oscillators_gui, 'osc3_Level', 0, 1).name('Triangle');;

  var filtG = gui.addFolder('Filter');
  filtG.add(Filter_gui, 'freq',100,16000).name('CutOff Frequency');
  filtG.add(Filter_gui, 'res',0,110).name('Resonance');

  MasterGain = new p5.Gain();
  OscGain = new p5.Gain();
  Filt = new p5.Filter();
  Filt.setType('lowpass');

  initOscs();

  // OscGain.setInput(Oscillators[0]);
  OscGain.amp(0.75);
  OscGain.disconnect();
  OscGain.connect(Filt);
  Filt.disconnect();
  Filt.connect(MasterGain);
  MasterGain.connect();
  // Oscillators.push(10);
  // Oscillators.push(osc1);
  fft = new p5.FFT();
  fft.setInput(MasterGain);

}


function draw() {
  background(0);
  for(var i = 0; i < Oscillators.length; i++){
  var str = 'Oscillators_gui.osc'+(i+1)+'_Level';
  Oscillators[i].amp(eval(str));
  Oscillators[i].freq(pow(2,i) * mouseX / width * 500);
  }
  Filt.freq(Filter_gui.freq);
  Filt.res(Filter_gui.res);

  drawFFT();

  // OscGain.amp(mouseY/height);

}

function drawFFT(){
  var spectrum = fft.analyze();
 noStroke();
 fill(0,255,0); // spectrum is green
 for (var i = 0; i< spectrum.length; i++){
   var x = map(i, 0, spectrum.length, 0, width);
   var h = -height + map(spectrum[i], 0, 255, height, 0);
   rect(x, height, width / spectrum.length, h )
 }

 var waveform = fft.waveform();
 noFill();
 beginShape();
 stroke(255,0,0); // waveform is red
 strokeWeight(1);
 for (var i = 0; i< waveform.length; i++){
   var x = map(i, 0, waveform.length, 0, width);
   var y = map( waveform[i], -1, 1, 0, height);
   vertex(x,y);
 }
 endShape();
}

function initOscs(){

  var osc1 = new p5.Oscillator();
  osc1.setType('square');
  osc1.freq(440);
  osc1.amp(Oscillators_gui.osc1_Level);

  osc1.start();
  osc1.disconnect();
  osc1.connect(OscGain);
  Oscillators.push(osc1);

  var osc2 = new p5.Oscillator();
  osc2.setType('sawtooth');
  osc2.freq(220);
  osc2.amp(Oscillators_gui.osc2_Level);
  osc2.disconnect();
  osc2.connect(OscGain);
  osc2.start();
  Oscillators.push(osc2);

  var osc3 = new p5.Oscillator();
  osc3.setType('triangle');
  osc3.freq(110);
  osc3.amp(Oscillators_gui.osc3_Level);
  osc3.disconnect();
  osc3.connect(OscGain);
  osc3.start();
  Oscillators.push(osc3);

}


function keyBoard() {
  // Draw a keyboard
  // The width for each key
  this.w = width / nkeys;
  this.mouseOver = false;
  this.drawKeys = function() {
    if (mouseY > height/2) this.mouseOver = true;
    else this.mouseOver = false;
    for (var i = 0; i < nkeys; i++) {
      var x = i * this.w;
      // If the mouse is over the key
      if (mouseX > x && mouseX < x + this.w && mouseY > height/2) {

        if (mouseIsPressed) {
          fill(100, 255, 200);
          // Or just rolling over
        } else {
          fill(127);
        }
      } else {
        fill(200);
      }
      // Draw the key
      stroke(0);
      rect(x, height/2, this.w-1, height/2);
    }
  }
}
