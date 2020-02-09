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
		}else if (event.keyCode === 32 && entities[0].grounded){
			entities[0].grounded = false;
			entities[0].vy = -300;
		}else if (event.keyCode === 16){
			entities[0].rolling = true;
		}
	});

	document.addEventListener("keyup", event => {
		if (event.keyCode === 37) {
			entities[0].vx = 0;
		}else if (event.keyCode === 39) {
			entities[0].vx = 0;
		}else if (event.keyCode === 16){
			entities[0].rolling = false;
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
		entities.push(newEntity(100, 100, 40, 80));
		terrain.push(newSegment(10, 100, 400, 300));
		entities.push(newEntity(450, 10, 20, 20));
		terrain.push(newSegment(400, 300, 410, 302));
		terrain.push(newSegment(410, 302, 420, 302));
		terrain.push(newSegment(420, 302, 430, 301));
		terrain.push(newSegment(430, 301, 440, 295));
		terrain.push(newSegment(440, 295, 450, 288));
		terrain.push(newSegment(500, 300, 800, 100));
	}

	// Match canvas resolution to document dimensions
	function resize() {
		if (canvas) {
			var tarWidth = 1920/2;
			var tarHeight = 1080/2;
			var width = canvas.clientWidth;
			var height = canvas.clientHeight;
			var scaleFitNative = Math.min(width / tarWidth, height / tarHeight);
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

		// context.beginPath();
		// context.moveTo(entities[0].c.x, entities[0].c.y);
		// var t = closestPointOnLine(terrain[1], entities[0].c.x, entities[0].c.y);
		// context.lineTo(t.x, t.y);
		// context.stroke();

		requestAnimationFrame(render);
	}
