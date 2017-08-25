  var Oscillators_gui = {
    osc1_Level: 0.45,
    osc2_Level: 0.3,
    osc3_Level: 0.2,
    Scale: 1
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
    freq: 2500,
    res: 1,
    type: 'lowpass'
  };


  var Oscillators, LFO, OscGain, Filt, Env, Delay, Reverb, MasterGain;
  var fft;

  var beat = 0;

  var scales = [
    [0, 2, 4, 5, 7, 9, 11],
    [0,2,4,7,11,12],
    [0,2,3,5,7,8,10]

  ];


  var scaleNo = Oscillators_gui.Scale;
  function audioSetup(){
    Oscillators = [];
        MasterGain = new p5.Gain();
        // OscGain = new p5.Gain();
        Filt = new p5.Filter();
        Filt.setType('lowpass');


        initOscs();


        // OscGain.amp(0.95);
        // OscGain.disconnect();
        // OscGain.connect(Filt);


        LFO = new p5.Oscillator();
        LFO.disconnect();
        LFO.setType('sine');
        LFO.freq(0.002);
        // LFO.phase(0.1)
        LFO.start();

        LFO.mult(5);

        // LFO.freq(Oscillators[2]);
        // Oscillators[0].amp(LFO,0.6);
        Oscillators[1].phase(0.2);
        Oscillators[1].amp(LFO,0.3);
        Oscillators[2].amp(LFO,0.042);

        Oscillators[1].panPosition = LFO;
        Oscillators[2].panPosition = LFO;

        // Oscillators[0].pan(LFO);
        // Oscillators[1].pan(LFO,0.03);
        // Oscillators[2].pan(LFO,0.02);
        Filt.freq(LFO);



        Filt.disconnect();
        // Filt.connect(MasterGain);


        // Reverb = new p5.Reverb();
        // Reverb.disconnect();
        // Reverb.process(Filt,2,0.5);
        //
        Delay = new p5.Delay();
        Delay.setType('pingPong')
        Delay.process(Filt, 0.72, .77, 1200);
        Delay.drywet(0.125);
        // Delay.delayTime(LFO);
        Delay.connect(MasterGain);

        MasterGain.connect();
  }
  function guiSetup(){
      var gui = new dat.GUI();
        gui.add(Oscillators_gui, 'Scale',{ Major: 0, MajorPenta: 1, Aeoleon: 2 } ).onChange(function(value){
        scaleNo = floor(Oscillators_gui.Scale);
        }

        );

        // gui.add(scaleNo,0,2);
        var oscG = gui.addFolder('Oscillators');
        oscG.add(Oscillators_gui, 'osc1_Level', 0, 1).name('Square').onChange(function(value){
          Oscillators[0].amp(Oscillators_gui.osc1_Level);
        });
        oscG.add(Oscillators_gui, 'osc2_Level', 0, 1).name('Sawtooth').onChange(function(value){
          Oscillators[1].amp(Oscillators_gui.osc2_Level);
        });;
        oscG.add(Oscillators_gui, 'osc3_Level', 0, 1).name('Triangle').onChange(function(value){
          Oscillators[2].amp(Oscillators_gui.osc2_Level);
        });;


        var filtG = gui.addFolder('Filter');
        filtG.add(Filter_gui, 'freq',100,16000).name('CutOff Frequency').onChange(function(value){
        Filt.freq(Filter_gui.freq);
        });

        filtG.add(Filter_gui, 'res',0,110).name('Resonance').onChange(function(value){
        Filt.res(Filter_gui.res);
        });
  }
  function setup() {


    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    audioSetup();
    guiSetup();
    fft = new p5.FFT();
    fft.setInput(MasterGain);
    background(0);
  }

function draw() {
    noCursor();

    noStroke();
    fill(255,20);
    textSize(14);
    text('philterSoup',(1 - mouseX/width) * width - width*0.25,height * 0.25);

    background(0,30);


    var index = floor((2.71828/3* mouseX/width * scales[scaleNo].length));

    var note = 12 + 12 * floor(1 + (mouseY/height * 3))+scales[scaleNo][index];

    for(var i = 0; i < Oscillators.length; i++){
    Oscillators[i].freq(pow(2,i)*midiToFreq(note + i * 7 ),0.01);
    }
    LFO.freq(mouseY/height * 0.025, 0.01);

    drawStars();
    drawFFT();
  }

  function drawStars(){
    for(var i = 0 ; i < width; i+= width/40 ){
      stroke(255);
      fill(255);
      var y = floor(randomGaussian(0,height));

      point(i,y);
    }

  }

  function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  }
  function drawFFT(){

    // drawStars();
    var spectrum = fft.analyze();


     for (var i = 0; i < spectrum.length/40; i++) {
      fill(spectrum[i], spectrum[i]/50, 127);
      var x = map(i, 0, spectrum.length/40, 0, width);
      var h = map(spectrum[i], 0, 255, 0, height * 0.75);
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
    osc1.connect(Filt);
    Oscillators.push(osc1);

    var osc2 = new p5.Oscillator();
    osc2.setType('sawtooth');
    osc2.freq(220);
    osc2.amp(Oscillators_gui.osc2_Level);
    osc2.disconnect();
    osc2.connect(Filt);
    osc2.start();
    Oscillators.push(osc2);

    var osc3 = new p5.Oscillator();
    osc3.setType('triangle');
    osc3.freq(110);
    osc3.amp(Oscillators_gui.osc3_Level);
    osc3.disconnect();
    osc3.connect(Filt);
    osc3.start();
    Oscillators.push(osc3);

  }
