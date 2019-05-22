//assign higher fitness to rockets that make to target faster
var rocket;
var population;
var lifespan = 380;
var count=0;
var target; 
var rx = 180;
var ry = 250;
var rw = 300;
var rh = 10;
var maxforce = 0.4;
var generation = 1 ;
var allCrashed = false;
var lifeP , gen , hits;
var hitCount=0;
function setup() {
  createCanvas(640,480);
  gen = createP();
  lifeP = createP();
  hits = createP();
  gen.html("Generation : "+generation);
  rocket = new Rocket();
  population = new Population();
  target = createVector(width/2,50);
}

function draw() {
  background(0);

  population.run();
  count++;
  allCrashed = population.checkCrashed();
  if(count == lifespan || allCrashed)
  {
  	generation++;
  	gen.html("Generation : "+generation);
  	hits.html("Hit Ratio : "+ (hitCount/population.popsize));
  	//console.log(hitCount);
  	hitCount = 0;
  	allCrashed = false;
  	population.evaluate();
  	population.selection();
  	count = 0 ;
  	
  }
  ellipse(target.x,target.y,16,16);
  rect(180,250,300,10)
}

function Population(){
	this.rockets=[];
	this.popsize=25;
	this.matingpool = [];
	for(var i=0;i<this.popsize;i++){
		this.rockets[i]=new Rocket;
	}
	this.checkCrashed = function()
	{
		var ctr=0;
		for(var i=0;i<this.popsize;i++)
		{
			if(this.rockets[i].crashed==false)
				ctr++;
		}
		if(ctr==0)
			return true;
		else
			return false;
	}
	this.evaluate = function(){
		var maxfit = 0;
		for(var i=0;i<this.popsize;i++)
		{
			this.rockets[i].calcFitness();
			if(this.rockets[i].fitness>maxfit){
				maxfit = this.rockets[i].fitness;
			}
		}
		lifeP.html("Max fitness : "+maxfit);
	for(var i=0;i<this.popsize;i++)
		{
			this.rockets[i].fitness /= maxfit;
		}
	this.matingpool = [];
	for(var i=0;i<this.popsize;i++)
	{
		var n=this.rockets[i].fitness*100;
		for(var j=0;j<n;j++)
		{
			this.matingpool.push(this.rockets[i]);
		}
	}
}
	 this.selection = function(){
		var newRockets = [];
		for(var i=0;i<this.rockets.length;i++){
			var parentA = random(this.matingpool).dna;
			var parentB = random(this.matingpool).dna;
			var child = parentA.crossover(parentB);
			child.mutation();
			newRockets[i] = new Rocket(child) ;
		}	
		this.rockets = newRockets;
	}
	this.run = function()
	{
		for(var i=0;i<this.popsize;i++)
		{
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}

}
function DNA(genes){
	if(genes)
	{
		this.genes = genes;
	}else{
		this.genes=[];
		//we will apply a single vector from its DNA in each frame 
		for(var i=0;i<lifespan;i++)
		{	
			this.genes[i]=p5.Vector.random2D();
			this.genes[i].setMag(maxforce);
		}
	}
	this.crossover = function(partner)
	{
		var newgenes = [];
		var mid = floor(random(this.genes.length));
		for(var i=0;i<this.genes.length;i++)
		{
			if(i<mid){
				newgenes[i]=this.genes[i];
			}else{
				newgenes[i]=partner.genes[i];
			}
		}
		return new DNA(newgenes);
	}
	this.mutation = function(){
		for(var i=0;i<this.genes.length;i++)
		{
			if(random(1)<0.01){
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxforce);
			}
		}
	}
}

// time to reach target should also be part of fitnessv  
function Rocket(dna)
{
	this.pos = createVector(width/2,height);
	this.vel = createVector();
	this.acc = createVector();
	this.completed = false;
	this.crashed = false;
	if(dna){
		this.dna = dna;
	}else{
		this.dna = new DNA();
	}
	this.fitness = 0;
	this.applyForce = function(force){
		this.acc.add(force);
	}

	this.calcFitness = function(){
		var d = dist(this.pos.x,this.pos.y,target.x,target.y); 
		this.fitness = map(d,0,width,width,0);
		if(this.completed)
		{
			this.fitness *= 10;
			this.fitness += (5*(lifespan - count));
			hitCount++;
		}
		if(this.crashed)
		{
			this.fitness/=10;;
		}
	}
	this.update = function(){
		var d = dist(this.pos.x,this.pos.y,target.x,target.y);
		if(d<10){
			this.completed = true;
			this.pos = target.copy();
		}
		if(this.pos.x>=rx && this.pos.x<=rx+rw && this.pos.y>=ry && this.pos.y<=ry+rh)
		{
			this.crashed=true;
		}
		if(this.pos.x>width || this.pos.x<0 || this.pos.y>height || this.pos.y<0)
		{
			this.crashed=true;
		}
		this.applyForce(this.dna.genes[count]);
		if(!this.completed && !this.crashed){
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.vel.limit(4);
		}
	}

	this.show = function(){
		push();
		noStroke();
		fill(255,150);
		translate(this.pos.x,this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER);
		rect(0,0,25,5);
		pop();
	}
}