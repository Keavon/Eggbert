document.addEventListener("DOMContentLoaded", setup);
window.addEventListener("resize", resize);

let canvas;
let context;
let placeholder = new Image();
placeholder.src = "assets/character/placeholder.png";
placeholder.addEventListener("load", setup);

function resize() {
	if (!canvas) return;
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

function setup() {
	canvas = document.querySelector("canvas");
	context = canvas.getContext("2d");
	resize();
	
	if (!placeholder.complete) return;
	render();
}

function render() {
	context.drawImage(placeholder, 0, 0, 500, 500);
	requestAnimationFrame(render);
	console.log(canvas.width, canvas.height);
	
}