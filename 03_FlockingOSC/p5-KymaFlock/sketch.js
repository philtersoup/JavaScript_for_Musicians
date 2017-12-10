var isConnected;
var flock;
var socket;
var flockarray;
var globalDecay;

var maxLength;


function setup() {
  createCanvas(windowWidth, windowHeight);
  isConnected = false;
  setupOsc(8338, 8000); //CHANGE PORT NO HERE
  flock = new Flock();
  maxLength = 1;
  // flockarray = {};

  // for(var i=0; i<15; i++){
  //   var boid = new Boid(random(width),random(height),flock.boids.length)
  //   flock.addBoid(boid);
  //   // flockArray.push(boid.position);
  // }
}

function draw() {

  // if(flock.boids.length < 5 ){
  //   // console.log('more');
  //   for(var i=0; i<3; i++){
  //     var boid = new Boid(random(width),random(height),flock.boids.length)
  //     flock.addBoid(boid);
  //     // flockArray.push(boid.position);
  //   }
  // }
  background(0,127+abs(sin(frameCount/100) * 127));
	flock.run();
  noStroke();
  fill(255,0,0,127);
  textSize(32);

  text(flock.boids.length,width/2,height/2);
}

// Add a new boid into the System
function mouseDragged() {
  // if(random(0,2)>1.3)
  flock.addBoid(new Boid(mouseX,mouseY, flock.boids.length));

  // console.log(flock.boids.length);

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
  for(var i  = 0; i < this.boids.length; i++){
    this.boids[i].run(this.boids);
    if(this.boids[i].age >= 1.0){
      // console.log(this.boids[i].id);
      socket.emit('message', ['/boid'+'/'+(this.boids[i].id+1) , this.boids[i].position.x/width,1-this.boids[i].position.y/height,
      Math.abs(this.boids[i].velocity.x), Math.abs(this.boids[i].velocity.y), 0.0]);
      flock.boids.splice(i,1);
    }
  }

  for (var i = 0; i < this.boids.length; i++){
    // this.boids[i].run(this.boids);
    // if(frameCount % 30 === 0){
        socket.emit('message', ['/boid'+'/'+(this.boids[i].id+1) , this.boids[i].position.x/width,1-this.boids[i].position.y/height,
        Math.abs(this.boids[i].velocity.x), Math.abs(this.boids[i].velocity.y), (1.0 - this.boids[i].age)]);
    // }
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
  this.acceleration = createVector(0,0);
  this.velocity = createVector(random(-1,1),random(-1,1));
  this.position = createVector(x,y);
  this.r = 4.0;
  this.maxspeed = 1;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force

  this.id = id;
  this.birthTime = millis();

  this.reproduced = false;
  // this.decayRate = globalDecay * random(0,0.25);

  this.lifeSpan = 100 * random(500);
  this.age = 0;

  this.gender = floor(random(0,2));

  // console.log(this);
}

Boid.prototype.reproduce = function(){
// background(0,10);

  if( floor(10*random()) >= 9 && flock.boids.length < maxLength && !this.reproduced ){
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

  this.age = (millis() - this.birthTime) / (this.lifeSpan);
  this.velocity.add(this.acceleration);

  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);

  this.acceleration.mult(0);

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
  var theta = this.velocity.heading() + radians(90);
  var alpha = 64 + this.age * 1270;

  if(this.age <= 0.025){
    fill(0,255,0,alpha);
    stroke(0,255,0,alpha);
  }
  else{
    if(this.gender == 0){
      fill(255,0,0,alpha);
      stroke(255,0,0,alpha);
    }
    else if(this.gender == 1){
      fill(0,0,255,alpha);
      stroke(0,0,255,alpha);
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
      if((millis() - this.birthTime > 3000) && (this.gender != boids[i].gender)){
        line(this.position.x,this.position.y,boids[i].position.x,boids[i].position.y);
        boids[i].reproduce();
      }
    }
  }
  if (count > 0) {
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
  // client: { port: oscPortOut, host: '192.168.1.200'}
	socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
	socket.on('connect', function() {
    isConnected = true;
    socket.emit('config', {
			server: { port: oscPortIn,  host: '127.0.0.1'},
      client: { port: oscPortOut, host: '127.0.0.1'}
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
