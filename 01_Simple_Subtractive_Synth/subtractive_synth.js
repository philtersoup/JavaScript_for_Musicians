  var Oscillators_gui = {
    osc1_Level: 0.45,
    osc2_Level: 0.3,
    osc3_Level: 0.2
  };

  var Envelope_gui = {
    attackTime: 0.001,
    decayTime: 0.25,
    susPercent: 0,
    releaseTime: 0.5,
    attackLevel: 0.95,
    releaseLevel: 0
  };

  var Filter_gui = {
    freq: 6000,
    res: 1,
    type: 'lowpass'
  };

  var Oscillators, OscGain, Filt, Env, MasterGain;
  var fft;

  var beat = 0;

  var items = [
    [0, 2, 4, 5, 7, 9, 11]

  ];

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

    var envG = gui.addFolder('Envelope');
    envG.add(Envelope_gui, 'attackTime',0.001,1).onChange(function(value) {
    Env.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env2.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    });;
    envG.add(Envelope_gui, 'decayTime',0.01,2).onChange(function(value) {
    Env.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env2.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    });;;
    envG.add(Envelope_gui, 'susPercent',0.0,1).onChange(function(value) {
    Env.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env2.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    });;;
    envG.add(Envelope_gui, 'releaseTime',0.1,3).onChange(function(value) {
    Env.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env2.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    });;;
    envG.add(Envelope_gui, 'attackLevel',0.0,1).onChange(function(value) {
    Env.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);
    Env2.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);
    });;;
    envG.add(Envelope_gui, 'releaseLevel',0.0,1).onChange(function(value) {
    Env.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);
    Env2.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);
    });;;



    MasterGain = new p5.Gain();
    OscGain = new p5.Gain();
    Filt = new p5.Filter();
    Filt.setType('lowpass');

    // pulse = new p5.Pulse();
    // pulse.amp(0.5);
    // pulse.freq(2);
    // pulse.start();



    // pulse.disconnect();

    Env = new p5.Env();
    // Env.setExp();
    Env.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);

    Env2 = new p5.Env();
    Env2.setExp();
    Env2.setADSR(Envelope_gui.attackTime, Envelope_gui.decayTime, Envelope_gui.susPercent, Envelope_gui.releaseTime);
    Env2.setRange(Envelope_gui.attackLevel, Envelope_gui.releaseLevel);

    // Env.triggerAttack(pulse);
    initOscs();

    // OscGain.setInput(Oscillators[0]);
    OscGain.amp(0.75);
    OscGain.disconnect();
    OscGain.connect(Filt);
    Filt.disconnect();

    // Env2.setInput(Filt);
    // Filt.amp(Env);
    // Filt.amp(Env.mult(7000));
    // Env2.setInput(Filt);
    // Env2.mult();

    Filt.freq(Env.mult(-5000));


    Filt.connect(MasterGain);


    // Filt.amp(Env);
    MasterGain.connect();
    // Oscillators.push(10);
    // Oscillators.push(osc1);
    fft = new p5.FFT();
    fft.setInput(MasterGain);

    var myPart = new p5.Part(); // on créer un objet Part qui va nous permettre de modifier la vitesse de lecture
    // on créer une phrase qui appelle la fonction 'step' à chaque temps. C'est dans cette fonction que l'on va jouer les sons
    var pulse = new p5.Phrase('pulse', step, [1, 1, 1, 1]);
    myPart.addPhrase(pulse); // on ajoute notre phrase à l'objet part
    myPart.setBPM(70);
    myPart.start();
    myPart.loop();

  }

  function step(){
  // console.log('called');
  Env2.play(Filt,0,0.1);
  Env.play(Filt.freq);

  // Filt.freq(Env);
  beat += 1;
  beat = beat % 16;
  // console.log(beat);

  }


  function draw() {
    background(0);

    var index = floor((2.71828/3*mouseX/width * items[0].length));

    var note = 12 + 12 * floor(1 + (mouseY/height * 3))+items[0][index];

    for(var i = 0; i < Oscillators.length; i++){
    var str = 'Oscillators_gui.osc'+(i+1)+'_Level';

    Oscillators[i].amp(eval(str));
    Oscillators[i].freq(pow(2,i)*midiToFreq(note));

    }
    Filt.freq(Filter_gui.freq);
    Filt.res(Filter_gui.res);


    drawStars();
    drawFFT();


  }
  function drawStars(){
    for(var i = 0 ; i < width; i++ ){
      stroke(255);
      fill(255);
      var y = floor(randomGaussian(0,height));

      point(floor(i*randomGaussian(0,2)),y);
    }

  }
  function drawFFT(){

    // drawStars();
    var spectrum = fft.analyze();


     for (var i = 0; i < spectrum.length/20; i++) {
      fill(spectrum[i], spectrum[i]/50, 0);
      var x = map(i, 0, spectrum.length/20, 0, width);
      var h = map(spectrum[i], 0, 255, 0, height);
      noStroke();
      rect(x, height, spectrum.length/20, -h);
      }
    }


  //  var waveform = fft.waveform();
   //
  //  noFill();
  //  beginShape();
  //  stroke(0,255,0); // waveform is red
  //  strokeWeight(1);
  //  for (var i = 0; i< waveform.length; i++){
  //    var x = map(i, 0, waveform.length, 0, width);
  //    var y = map( waveform[i], -1, 1, 0, height);
  //    vertex(x,y);
  //  }
  //  endShape();


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
