document.addEventListener("DOMContentLoaded", setup);

let canvas;
let context;

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
	preloadSprites().then(render);
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
	const placeholder = getSpriteFrame("character/placeholder");
	context.drawImage(placeholder, 0, 0, 500, 500);

	requestAnimationFrame(render);
}