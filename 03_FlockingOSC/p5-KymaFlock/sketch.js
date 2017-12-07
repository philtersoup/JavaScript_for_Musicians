var isConnected;
var flock;
var socket;
var flockarray;
var globalDecay;



function setup() {
  createCanvas(windowWidth, windowHeight);
  isConnected = false;
  setupOsc(8338, 8000); //CHANGE PORT NO HERE
  flock = new Flock();
  globalDecay = 5;
  // flockarray = {};

  for(var i=0; i<15; i++){
    var boid = new Boid(random(width),random(height),flock.boids.length)
    flock.addBoid(boid);
    // flockArray.push(boid.position);
  }
}

function draw() {

  if(flock.boids.length < 5 ){
    // console.log('more');
    for(var i=0; i<3; i++){
      var boid = new Boid(random(width),random(height),flock.boids.length)
      flock.addBoid(boid);
      // flockArray.push(boid.position);
    }
  }
  background(0,abs(sin(frameCount/100) * 255));
	flock.run();
  noStroke();
  textSize(32);
  text(flock.boids.length,width/2,height/2);
}

// Add a new boid into the System
function mouseDragged() {
  if(random(0,2)>1.3)
  flock.addBoid(new Boid(mouseX,mouseY),flock.length);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

Flock.prototype.run = function() {
  for (var i = 0; i < this.boids.length; i++) {

    if(this.boids[i].age < 0){
    // console.log('dead');
    this.boids.splice(i);
  }
    else{
    this.boids[i].run(this.boids);
    if(frameCount % 30 === 0){
      socket.emit('message', ['/boid'+'/'+(i+1) , this.boids[i].position.x/width,1-this.boids[i].position.y/height,
      Math.abs(this.boids[i].velocity.x), Math.abs(this.boids[i].velocity.y), (this.boids[i].age/this.boids[i].lifeSpan)]);
    }
  }
}

}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x,y,id) {
  this.id = id;
  this.birthTime = floor(millis());
  this.reproduced = false;
  this.decayRate = globalDecay * random(0,0.25);
  this.age = floor(random(1000,2550));
  this.lifeSpan = this.age;
  this.gender = floor(random(0,2));
  this.acceleration = createVector(0,0);
  this.velocity = createVector(random(-1,1),random(-1,1));
  this.position = createVector(x,y);
  this.r = 4.0;
  this.maxspeed = 1;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.reproduce = function(){
// background(0,10);
if( random(0,1) > 0.15 && !this.reproduced && flock.boids.length < 150){
flock.addBoid(new Boid(this.position.x + random(-150,150),this.position.y+random(-50,50),flock.length));
this.reproduced = true;
}


}
Boid.prototype.run = function(boids) {

  this.flock(boids);
  this.update();
  this.borders();
  this.render();

}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.3);
  coh.mult(1.2);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  if(this.age>0) this.age -= this.decayRate;
  // else this.age = 255;
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
  // socket.emit('message', ['/agent'+, 1]);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.death = function() {


}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  var theta = this.velocity.heading() + radians(90);

  if( floor(millis()) - this.birthTime < 1700 * random(0,1) ){
  // console.log(frameCount - this.birthTime);
  fill(0,255,0,this.age / this.lifeSpan * 255)
  stroke(0,255,0, this.age / this.lifeSpan * 255);
  }
  else {
  switch(this.gender+1){
    case 1:
    fill(255,0,0,this.age / this.lifeSpan * 255)
    stroke(255,0,0, this.age / this.lifeSpan * 255);
    break;

    case 2:
    fill(0,0,255,this.age / this.lifeSpan * 255)
    stroke(0,0,255,this.age / this.lifeSpan * 255);
    break;


  }
}

  push();
  translate(this.position.x,this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r*2);
  vertex(-this.r, this.r*2);
  vertex(this.r, this.r*2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width +this.r;
  if (this.position.y < -this.r)  this.position.y = height+this.r;
  if (this.position.x > width +this.r) this.position.x = -this.r;
  if (this.position.y > height+this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 45.0;
  var steer = createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);

      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 70;
  var sum = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
      stroke(255,this.age % 255);
      if((frameCount - this.birthTime > 30) && (this.gender != boids[i].gender)){
      line(this.position.x,this.position.y,boids[i].position.x,boids[i].position.y);
      // this.reproduced = true;
      boids[i].reproduce();
    }
      // if(random(0,2)>1.2)
      // flock.addBoid(new Boid(random(width),random(height)),flock.length);
      // if(this.gender != boids[i].gender)
      // console.log(d)

    }
  }
  if (count > 0) {
    // console.log(d);
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 70;
  var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0,0);
  }
}

function receiveOsc(address, value) {

}

function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
    isConnected = true;
    socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
			client: { port: oscPortOut, host: '192.168.1.200'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}
