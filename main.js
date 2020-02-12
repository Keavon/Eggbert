// document.addEventListener("DOMContentLoaded", setup);

let canvas;
let context;
let scaleFitNative;

let entities = [];
let player;
let lastTime;

let drawDebug = true;

function preloadSprites() {
	return Promise.all([
		loadSprite("character/placeholder"),
	]);
}

// Prepare for then execute render loop
function setup() {
	// Get canvas
	canvas = document.querySelector("canvas");
	context = canvas.getContext("2d");

	// Make canvas fit document
	resize();
	window.addEventListener("resize", resize);

	// Preload game assets then begin render loop
	preloadSprites().then(() => {
		setupLevel();
		lastTime = Date.now();
		render();
	});
}

function setupLevel(){
	// var e = newEntity(0, 500, 1000, 32);
	// e.static = true;
	// entities.push(e);
	setupPlayer();
	terrain.push(newSegment(10, 100, 400, 300));
	entities.push(newEntity(1150, 10, 20, 20));
	terrain.push(newSegment(400, 300, 410, 302));
	terrain.push(newSegment(410, 302, 420, 302));
	terrain.push(newSegment(420, 302, 430, 301));
	terrain.push(newSegment(430, 301, 440, 295));
	terrain.push(newSegment(440, 295, 450, 288));
	terrain.push(newSegment(500, 300, 800, 100, true));
	terrain.push(newSegment(0, 400, 1000, 400));
	terrain.push(newSegment(800, 100, 950, 400, true));

	var t1 = newSegment(800, 400, 1000, 300);
	var t2 = newSegment(1100, 300, 1300, 400);
	terrain.push(t1);
	curveBetween(t1, t2, false, 10);
	terrain.push(t2);

	terrain.push(newSegment(1200, 10, 1200, 500));
}

// Match canvas resolution to document dimensions
function resize() {
	if (canvas) {
		var tarWidth = 1920/2;
		var tarHeight = 1080/2;
		var width = canvas.clientWidth;
		var height = canvas.clientHeight;
		scaleFitNative = Math.min(width / tarWidth, height / tarHeight);
		if(scaleFitNative < 1){
			context.imageSmoothingEnabled = false; // turn it on for low res screens
		}else{
			context.imageSmoothingEnabled = true; // turn it off for high res screens.
		}
		canvas.width = width;
		canvas.height = height;
		context.setTransform(
			scaleFitNative,0,
			0,scaleFitNative,
			0,
			0
		);
	}
}

// Render loop called once per frame
function render() {
	var now = Date.now();
	var delta = (now - lastTime) / 1000.0;
	lastTime = now;



	if (!pause){
		updatePlayer(delta);
		entities.forEach((entity, i) => {
			update(entity, delta);
		});
	}

	var canvasOffset = {
		x: -player.c.x * scaleFitNative + canvas.width/2,
		y: -player.c.y * scaleFitNative + canvas.height/2
	}
	context.setTransform(
		scaleFitNative,0,
		0,scaleFitNative,
		canvasOffset.x,
		canvasOffset.y
	);

	// context.clearRect(0, 0, canvas.width, canvas.height);
	context.clearRect(-canvasOffset.x / scaleFitNative, -	canvasOffset.y / scaleFitNative, canvas.width, canvas.height);

	// const placeholder = getSpriteFrame("character/placeholder");
	// context.drawImage(placeholder, 0, 0, 500, 500);
	entities.forEach((entity, i) => {
		drawEntity(entity, context);
	});
	terrain.forEach((t, i) => {
		drawTerrain(context, t);
	});

	if (pause){
		rollCredits(delta);
	}


	requestAnimationFrame(render);
}
