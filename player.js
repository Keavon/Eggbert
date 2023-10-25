
let control = false;
let left = false;
let right = false;
let rightLast = false; //which button was pressed last
let shellIntegrity = 100;

let sounds = {
  crack: "crack.wav",
	step1: "step1.mp3",
	step2: "step2.mp3",
  music: "music.mp3",
  //need below this line
  // roll: "rolling.wav",
  // jump: "jump.wav",
  // victory: "victory.wav",
  // chirp: "chirp.wav"
}

const ROLL_ACCEL = 200;
const WALK_SPEED = 300;

function updatePlayer(delta){
  //calculate player direction
  if ((player.rolling || !player.grounded) && !player.forceSlide){
		player.idle = false;
    var xChange;
    var accel = player.rolling ? ROLL_ACCEL : ROLL_ACCEL * 10;
    if (rightLast){
      xChange = delta * (right ? accel : left ? -accel : 0);
    } else{
      xChange = delta * (left ? -accel : right ? accel : 0);
    }
    if (player.grounded){
      var theta = Math.atan2(player.vy, player.vx);
      player.vy += Math.sin(theta) * xChange;
      player.vx += xChange;
    }else {
      player.vx += xChange;
      if (!player.rolling){
        animate(player, "character/fall/fall");
      }
    }
    if (!player.rolling){
      player.vx = player.vx.clamp(-WALK_SPEED, WALK_SPEED);
    }
  } else if (!player.forceSlide){
    if (rightLast){
      player.vx = right ? WALK_SPEED : left ? -WALK_SPEED : 0;
    } else{
      player.vx = left ? -WALK_SPEED : right ? WALK_SPEED : 0;
    }
    if (player.grounded && player.vx != 0){
      player.idle = false;
      animate(player, "character/run/run");
      if (player.frame == 0){
        sounds.step1.play();
      } else if (player.frame > numFrames("character/run/run") / 2){
        sounds.step2.play();
      }

    } else if (player.grounded){
      if (!player.idle){
        player.idle = true;
        animate(player, "character/idle1/idle1");
        player.idleLoop = (5 + Math.floor(Math.random() * 10));
      }else if (player.idleLoop <= 0 && player.nextAnim == player.img){
        player.nextAnim = (2 + Math.floor(Math.random() * 1) === 1 ? "character/idle1/idle1" : "character/idle2/idle2");
      }
    }
    if (player.vx == 0){
      // sounds.step.stop();
    }
  } else{
   //forceSlide
   if (player.img != "character/roll/roll"){
     animate(player, "character/roll/roll");
   }
    //falling
    // if (player.img != "character/fall/fall"){
    //   animate(player, "character/fall/fall");
    // }
 }
  //end player direction
}

function setupPlayer(){
  player = newEntity(822, 1685, 60, 60);
  // player = newEntity(1150, -2500, 40, 80);
  player.type = "player";
  player.mask = [0];
  Object.keys(sounds).forEach((key) => {
    sounds[key] = new sound(sounds[key]);
  })
  sounds.music.play();
  sounds.music.sound.loop = true;
  entities.push(player); // add to update/collision list
  player.rolling = true;
  animate(player, "character/roll/roll");

  document.addEventListener("keydown", event => {
    if (!control){
      return;
    }
    switch (event.code){
      case "KeyA":
      case "ArrowLeft":
      left = true;
      rightLast = false;
      break;
      case "KeyD":
      case "ArrowRight":
      right = true;
      rightLast = true;
      break;
      case "Space":
      if (player.grounded){
        player.idle = false;
        player.grounded = false;
				if (player.vy < 0){
					player.vy += -500;
				}
				else{
					player.vy = -800;
				}
				if (!player.rolling){
					animate(player, "character/jump/jump", "character/fall/fall");
				}
			}
			break;
			case "KeyS":
			case "ArrowDown":
			if (player.grounded && player.lastGround.oneWay && !player.phasing.includes(player.lastGround)){
				player.phasing.push(player.lastGround);
			}
			break;
			case "ShiftLeft":
			if (!player.rolling && player.grounded){
				//initial roll convert
				var theta = -Math.atan(player.lastGround.slope);
				player.vy = Math.sin(theta) * player.vx;
				player.vx = Math.cos(theta) * player.vx;
			}
			if (!player.rolling){
				animate(player, "character/roll/roll");
			}
			player.rolling = true;
			break;
			case "KeyX":
			drawDebug = !drawDebug;
			break;
		}
	});
	document.addEventListener("keyup", event => {
		if (!control){
			return;
		}
		switch(event.code){
			case "KeyA":
			case "ArrowLeft":
			left = false;
			break;
			case "KeyD":
			case "ArrowRight":
			right = false;
			break;
			case "ShiftLeft":
			player.rolling = false;
			break;
		}
	});

}

function sound(src) {
	this.sound = new Audio("sounds/" + src);
	// this.sound.src = "sounds/" + src;
	// this.sound.setAttribute("preload", "auto");
	// this.sound.setAttribute("controls", "none");
	// this.sound.style.display = "none";
	this.sound.volume = .3;
	// document.body.appendChild(this.sound);
	this.play = function(){
		this.sound.play();
	}
	this.stop = function(){
		this.sound.pause();
	}
}
