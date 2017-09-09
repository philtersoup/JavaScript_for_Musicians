var mySound;
var playrate;
var voices = 0;
function preload() {

  mySound = loadSound('audioSource.mp3');

}

function setup() {
playRate = mouseY/height;

reverb = new p5.Reverb();
 mySound.disconnect(); // so we'll only hear reverb...

 // connect soundFile to reverb, process w/
 // 3 second reverbTime, decayRate of 2%
 reverb.process(mySound, 3, 10);
 reverb.drywet(0.5);

if(mySound.isLoaded){

  mySound.play();
  mySound.loop(0.1,playRate/10,0.65,mySound.duration()/4,mySound.duration()/100);
  }

}

function draw(){
  // playRate = map(mouseY,0,height,-0.75,0.65)/20;
  playRate = (2 * (mouseY/height - 2 ) / 20 ) || 0.001 ;
  mySound.rate(playRate);


}

function mousePressed(){
voices++;
mySound.loop(0.1,playRate,0.35,Math.random()*mySound.duration(),mySound.duration()/100 * Math.random());

if(voices>5){
mySound.stop();
voices = 0;
}

}
// function mouseReleased()(){
//   mySound.stop();
// }
