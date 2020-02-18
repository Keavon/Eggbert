// document.addEventListener("DOMContentLoaded", setup);

let canvas;
let context;
let scaleFitNative;

let entities = [];
let player;
let lastTime;

let drawDebug = true;

let screenText = "";
let screenTimeout;
let start;
let pause = false;
let gameOver = false;

function preloadSprites() {
	return Promise.all([
		// loadSprite("character/run/left", 6),
		// loadSprite("character/run/right", 6),
		loadSprite("character/run/run", 6),
		loadSprite("character/idle/idle1", 4),
		loadSprite("character/idle/idle2", 4),
		loadSprite("character/roll/roll", 2),
		loadSprite("character/jump/jump", 4),
		loadSprite("character/fall/fall", 2),
		loadSprite("rock/solid"),
		loadSprite("rock/broken"),
		loadSprite("level"),

	]);
}

function message(t){
	clearTimeout
	screenText = t;
	clearTimeout(screenTimeout);
	screenTimeout = setTimeout(() => {screenText = "";clearTimeout();}, 5000);
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
		setupLevel().then(() => {
			lastTime = Date.now();
			message("Find a way to break out of your shell! Press SHIFT to roll.");
			render();
		});
	});
}

function setupLevel(){
	setupPlayer();
	//this is an invisible entity which yields control to the player at the start
	//of the game
	var e = newEntity(550, 150, 10, 10);
	e.type = "controlTrigger";
	e.img = null;
	entities.push(e);

	//add rocks here!
	for(var i = 0; i < 12; i++){
		entities.push(newEntity(1100 + i * 1000, 0, 30, 15));
	}

	//generate terrain from mesh
	return fetch('assets/asdf.obj', {mode: 'no-cors'})
	.then(response => response.text())
	.then(data => loadTerrain(data));
	}

	const TERRAIN_OFFSET = {x: 2020, y: 250};
	const TERRAIN_SCALE = 62;
function loadTerrain(data){
	var vertices;
	var vertexMatches = data.match(/^v( -?\d+(\.\d+)?){3}$/gm);
	if (vertexMatches)
	{
		vertices = vertexMatches.map(function(vertex)
		{
			var vertices = vertex.split(" ");
			vertices.shift();
			vertices.forEach((v, i) => {
				vertices[i] = parseFloat(v) * TERRAIN_SCALE;
			});

			return vertices;
		});
	}
	var lineMatches = data.match(/^l( \d+){2}$/gm);
	if (lineMatches)
	{
		lineMatches.map(function(vertex)
		{
			var v = vertex.split(" ");
			v.shift();
			v.forEach((a, i) => {
				v[i] = parseInt(a) - 1;
			});
			terrain.push(newSegment(vertices[v[0]][0] + TERRAIN_OFFSET.x, -vertices[v[0]][1] + TERRAIN_OFFSET.y,
				vertices[v[1]][0] + TERRAIN_OFFSET.x, -vertices[v[1]][1] + TERRAIN_OFFSET.y, true));
		});
	}
	// terrain.push(newSegment(200, 0, 200, 1000, true));
	// terrain.push(newSegment(200, 50, 200, 1000, true));
	// terrain.push(newSegment(200, 50, 210, 50, true));
	terrain.push(newSegment(-100, 300, 3000, 300, true));
}

// Match canvas resolution to document dimensions
function resize() {
	if (canvas) {
		var tarWidth = 1920 / 2;
		var tarHeight = 1080 / 2;
		var width = canvas.clientWidth;
		var height = canvas.clientHeight;
		scaleFitNative = Math.min(width / tarWidth, height / tarHeight);
		if(scaleFitNative < 1){
			context.imageSmoothingEnabled = true; // turn it on for low res screens
		}else{
			context.imageSmoothingEnabled = false; // turn it off for high res screens.
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

	if (!pause && !gameOver){
		updatePlayer(delta);
		entities.forEach((entity, i) => {
			update(entity, delta);
		});
	}

	var canvasOffset = {
		x: (-player.c.x * scaleFitNative + canvas.width/2) / scaleFitNative,
		y: (-player.c.y * scaleFitNative + canvas.height/2) / scaleFitNative
	}
	context.setTransform(
		scaleFitNative,0,
		0,scaleFitNative,
		canvasOffset.x * scaleFitNative,
		canvasOffset.y * scaleFitNative
	);

	context.clearRect(-canvasOffset.x, -	canvasOffset.y, canvas.width / scaleFitNative, canvas.height / scaleFitNative);

	context.drawImage(getSpriteFrame("level", 0), -460, -1575);

	entities.forEach((entity, i) => {
		drawEntity(entity, context);
	});
	if (drawDebug){
		terrain.forEach((t, i) => {
			drawTerrain(context, t);
		});
	}

	context.font = "30px Indie Flower";
	context.fillStyle = "black";
	context.textAlign = "center";
	context.fillText(screenText, 600 - canvasOffset.x, 200 - canvasOffset.y);

	if (start != null && !gameOver){
		context.fillText((lastTime - start) / 1000, 100 -canvasOffset.x, 100 -canvasOffset.y);
	}
	requestAnimationFrame(render);
}

function winGame(){
	clearTimeout();
	clearTimeout(screenTimeout);
	setTimeout(rollCredits, 4000);
	gameOver = true;
	screenText = "Victory! You broke out of the shell in: " + ((lastTime - start) / 1000) + "s!";
}
