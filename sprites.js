let sprites = {};

function loadSprite(path, frames = 1) {
	const promises = [];

	sprites[path] = [];
	for (let i = 0; i < frames; i++) {
		const sprite = new Image();
		sprite.src = `assets/${path}~${i}.png`;
		sprites[path].push(sprite);

		let resolvePromise;

		const promise = new Promise((resolve, reject) => {
			resolvePromise = resolve;
		});
		promises.push(promise);
		sprite.addEventListener("load", resolvePromise);
	}

	return Promise.all(promises);
}

function getSpriteFrame(path, frame = 0) {
	return sprites[path][frame % numFrames(path)];
}

function numFrames(path){
	return sprites[path].length;
}
