var buttonArray;
var audioArray;

function preload(){
  audioArray = [];
  loadFiles();

}

function loadFiles(){
  for(var i = 0; i<6; i++){
    mySound = loadSound('audio/'+ (i+1) +'.mp3');
    mySound.setVolume(0.1);
    audioArray.push(mySound);
  }


}
function setup() {

buttonArray = [];
var col = color(0,0);

createCanvas(windowWidth,windowHeight);

for(var i = 0; i<6; i++){

  var button = createButton("Sound "+(i+1));
  button.style("background-color", col);
  button.id(i);
  button.position(i * width/6 , height/2);
  button.mousePressed(function(i){
  var id = this.elt.id;

  playSound(id);

  });

  buttonArray.push(button);
}
// audioArray[0].setVolume(0.1);
// audioArray[0].play();
background(127);
}

function playSound(i){

  audioArray[i].play();

}

function draw(){

}
