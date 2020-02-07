document.addEventListener("DOMContentLoaded", setup);

let canvas;
let context;

let entities = [];
let lastTime;

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
		render();});
}

function setupLevel(){
	var e = newEntity(0, 500, 1000, 32);
	e.static = true;
	entities.push(e);
	entities.push(newEntity(100, 100, 20, 20));
}

// Match canvas resolution to document dimensions
function resize() {
	if (canvas) {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
	}
}

// Render loop called once per frame
function render() {

	var now = Date.now();
	var delta = (now - lastTime) / 1000.0;
	lastTime = now;

	entities.forEach((entity, i) => {
		update(entity, delta, entities);
	});

	const placeholder = getSpriteFrame("character/placeholder");
	context.drawImage(placeholder, 0, 0, 500, 500);
	entities.forEach((entity, i) => {
		drawEntity(entity, context);

	});


	requestAnimationFrame(render);
}
