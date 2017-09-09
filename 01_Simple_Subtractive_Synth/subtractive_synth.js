  var Oscillators_gui = {
    osc1_Level: 0.45,
    osc2_Level: 0.3,
    osc3_Level: 0.2,
    Scale: 1
  };
  var col;
  var Envelope_gui = {
    attackTime: 0.001,
    decayTime: 0.25,
    susPercent: 0,
    releaseTime: 0.5,
    attackLevel: 0.95,
    releaseLevel: 0
  };

  var Filter_gui = {
    freq: 2000,
    res: 1,
    type: 'lowpass'
  };


  var Pluck, Oscillators, LFO, OscGain, Filt, Env, Delay, Reverb, MasterGain;
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

        LFO.setType('sine');
        LFO.freq(0.005);
        LFO.amp(0.71);
        LFO.phaseAmount = 3.14;
        LFO.start();
        LFO.disconnect();



        LFO.freq(Oscillators[2],0.1);


        // LFO.mult(4);

        // LFO.freq(Oscillators[2]);
        // Oscillators[0].freq(LFO.mult(50));

        // Oscillators[1].phase(0.02);
        Oscillators[0].amp(LFO);
        Oscillators[1].amp(LFO);
        Oscillators[2].amp(LFO);

        Oscillators[1].panPosition = LFO;
        Oscillators[2].panPosition = LFO;
        Oscillators[0].width = LFO;


        // Filt.freq(LFO);
        // Oscillators[2].freq[LFO];



        Filt.disconnect();
        // Filt.freq.value = LFO;

        Env = new p5.Env();
        Env.setADSR(0.0001, 0.25, 0.001, 0.005);
        Env.setRange(0.8,0);
        Env.setExp();
        // Filt.connect(MasterGain);


        // Reverb = new p5.Reverb();
        // Reverb.di  sconnect();
        // Reverb.process(Filt,2,0.5);
        //
        Delay = new p5.Delay();
        Delay.setType('pingPong')
        Delay.process(Filt, 0.72, .65, 300);
        Delay.drywet(0.255);
        // Delay.feedback(LFO);
        // Delay.delayTime(LFO);
        Delay.connect(MasterGain);

        MasterGain.connect();
  }
  function guiSetup(){
      var gui = new dat.GUI();
        gui.add(Oscillators_gui, 'Scale',{ Major: 0, MajorPenta: 1, Aeolian: 2 } ).onChange(function(value){
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
    colorMode(HSL,255);

    frameRate(30);
    audioSetup();
    guiSetup();


    col = color(160, 55, 100);

    fft = new p5.FFT();
    fft.setInput(MasterGain);
    background(col);
  }

function draw() {
    // noCursor();

    noStroke();
    fill(255,20);
    textSize(14);
    text('philterSoup',width-mouseX,height * 0.25);

    background(0,30);


        var index = floor((2.71828/3* mouseX/width * scales[scaleNo].length));

        var note = 12 + 12 * floor(1 + (mouseY/height * 3))+scales[scaleNo][index];

        for(var i = 0; i < Oscillators.length; i++){
        Oscillators[i].freq(pow(2,i)*midiToFreq(note + i * 7 ),0.01);
        }



    LFO.freq.value = (1 - mouseY/height) * 40;



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
  function mousePressed(){
    var Plucknote = 48 + scales[scaleNo][floor(Math.random()*scales[scaleNo].length)];
    Pluck.freq(midiToFreq(Plucknote),0.001);
    col.levels[0] = floor(randomGaussian(127,200));
    Env.play(Pluck,0,0.001);




    // fill(127);

    // ellipse(randomGaussian(0,width),Math.random()*height * 0.25,50,50);

  }
  function drawFFT(){

    // drawStars();
    var spectrum = fft.analyze();
    var energy = fft.getEnergy('bass');

    col.levels[2] = floor(energy/255 * 255);
    // console.log(col.levels[2]*255);
     for (var i = 0; i < spectrum.length/40; i++) {
      fill(200-col.levels[0], spectrum[i]/3, spectrum[i]/2);
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

    Pluck = new p5.Oscillator();
    Pluck.setType('sine');
    Pluck.disconnect();
    Pluck.connect(Filt);
    Pluck.amp(0);
    Pluck.start();


    var osc1 = new p5.Pulse();
    // osc1.setType('square');
    osc1.freq(440);
    // osc1.amp(Oscillators_gui.osc1_Level);

    osc1.start();
    osc1.disconnect();
    osc1.connect(Filt);
    Oscillators.push(osc1);

    var osc2 = new p5.Oscillator();
    osc2.setType('sawtooth');
    osc2.freq(220);
    // osc2.amp(Oscillators_gui.osc2_Level);
    osc2.phaseAmount = 0.5;
    osc2.disconnect();
    osc2.connect(Filt);
    osc2.start();
    Oscillators.push(osc2);

    var osc3 = new p5.Oscillator();
    osc3.setType('triangle');
    osc3.freq(110);
    // osc3.amp(Oscillators_gui.osc3_Level);
    osc3.disconnect();
    osc3.connect(Filt);
    osc3.start();
    Oscillators.push(osc3);

  }
