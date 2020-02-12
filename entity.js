
const ANIMATION_FPS = 30;
const gravity = 2000;

function newEntity(x = 0, y = 0, w = 0, h = 0){
  return {
    hitBox: newRect(x, y, w, h),
    type: "rock",
    layer: 0,
    mask: [],
    img: null,
    frame: 0,
    nextAnim: true, //true = loop same anim
    nextFrame: 1.0/ANIMATION_FPS,
    static: false,
    grounded: false,
    rolling: false,
    lastGround: null,
    vx: 0.0,
    vy: 0.0,
    c: newCircle(x + w/2, y + h - h/4, h/4),
    debugP: null,
  }
}

function animate(entity, anim, nextAnim = true){
  entity.frame = 0;
  entity.img = anim;
  entity.nextAnim = nextAnim;
}

function setVel(entity, vx, vy){
  entity.vx = vx;
  entity.vy = vy;
}

function newRect(x = 0, y = 0, w = 0, h = 0){
  return {
    x: x,
    y: y,
    w: w,
    h: h
  };
}

function update(entity, delta, onCollision = null){
  entity.nextFrame -= delta;
  if (entity.img != null && entity.nextFrame <= 0){
    entity.frame++;
    entity.frame %= numFrames(entity.img);
    if (entity.frame == 0 && entity.nextAnim !== true){
      entity.img = nextAnim;
      entity.nextAnim = true; //loop the new anim
    }
    entity.nextFrame += 1/ANIMATION_FPS;
  }

  if (entity.static){
    return;
  }

  if(!entity.grounded){
    entity.vy += gravity * delta;
  }

  entity.hitBox.x += entity.vx * delta;
  entity.hitBox.y += entity.vy * delta;

  //in case of clipping through terrain
  var prevPos = {x: entity.c.x, y: entity.c.y};

  entity.c.x = entity.hitBox.x + entity.hitBox.w/2;
  entity.c.y = entity.hitBox.y + entity.hitBox.h - entity.c.r;
  // console.log(entity.c.r);

  // if (onCollision != null){
  if (entity.mask.length > 0){
    entities.forEach(e => {
      if (entity.mask.includes(e.layer) && entity !== e && collides(entity, e)){
        if (onCollision != null){
          onCollision(entity, e);
        }
        if (entity.type == "player" && e.type == "rock"){
          var s = entity.vx * entity.vx + entity.vy * entity.vy;
          // shellIntegrity -= 2 * Math.log(s + 0.0) / Math.log(2.0);
          console.log(Math.sqrt(s));
          shellIntegrity -= Math.sqrt(s)/100;
          entity.vx = 0;
          entity.vy = 0;
          e.layer = -1;
          console.log(shellIntegrity);
          if (shellIntegrity <= 0){
            // winGame();
          }
        }
        // console.log("collision");
        if (e.static){
          entity.vy = 0;
          entity.grounded = true;
          entity.hitBox.y = e.hitBox.y - entity.hitBox.h;
        }
      }
    });}
    entity.grounded = checkEntityTerrain(entity, delta, prevPos);
    // }

    return
  }

  function drawEntity(entity, context){
    context.fillStyle = 'green';
    if (entity.img == null){
      context.fillRect(entity.hitBox.x, entity.hitBox.y, entity.hitBox.w, entity.hitBox.h);
    }else{
      context.drawImage(getSpriteFrame(entity.img, entity.frame), entity.hitBox.x, entity.hitBox.y);
    }
    if (drawDebug){
      //draw hitbox
      context.beginPath();
      context.rect(entity.hitBox.x, entity.hitBox.y, entity.hitBox.w, entity.hitBox.h);
      context.stroke();

      //draw terrain circle
      context.beginPath();
      context.arc(entity.c.x, entity.c.y, entity.c.r, 0, 2 * Math.PI, false);
      context.strokeStyle = '#003300';
      context.stroke();

      //draw debug line
      if (entity.debugP != null){
        context.beginPath();
        context.moveTo(entity.c.x, entity.c.y);
        var t = closestPointOnLine(terrain[1], entity.c.x, entity.c.y);
        context.lineTo(entity.debugP.x, entity.debugP.y);
        context.stroke();
      }

    }
  }

  function collides(entity1, entity2){
    // console.log("check");
    return intersects(entity1.hitBox, entity2.hitBox);
  }

  //check rectangle collision
  function intersects(rect1, rect2){
    return (rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y);
    }

    //check point in rect
    function contains(rect, x, y){
      return rect.x <= x &&
      rect.x + rect.w >= x &&
      rect.y <= y &&
      rect.y + rect.h >= y;
    }
