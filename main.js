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

	document.addEventListener("keydown", event => {
		if (event.keyCode === 37) {
			entities[0].vx = -100;
		}else if (event.keyCode === 39) {
			entities[0].vx = 100;
		}else if (event.keyCode === 32){
			entities[0].grounded = false;
			entities[0].vy = -100;
		}
	});

	document.addEventListener("keyup", event => {
		if (event.keyCode === 37) {
			entities[0].vx = 0;
		}else if (event.keyCode === 39) {
			entities[0].vx = 0;
		}
	});

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
		// var e = newEntity(0, 500, 1000, 32);
		// e.static = true;
		// entities.push(e);
		entities.push(newEntity(100, 100, 20, 20));
		terrain.push(newSegment(10, 200, 400, 300));
		entities.push(newEntity(450, 10, 20, 20));
		terrain.push(newSegment(400, 300, 500, 30));
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
			update(entity, delta);
		});



		const placeholder = getSpriteFrame("character/placeholder");
		context.drawImage(placeholder, 0, 0, 500, 500);
		entities.forEach((entity, i) => {
			drawEntity(entity, context);
		});
		terrain.forEach((t, i) => {
			drawTerrain(context, t);
		});


		requestAnimationFrame(render);
	}
