
const ANIMATION_FPS = 30;
const gravity = 500;

function newEntity(x = 0, y = 0, w = 0, h = 0){
  return {
    hitBox: newRect(x, y, w, h),
    img: null,
    frame: 0,
    nextFrame: 1.0/ANIMATION_FPS,
    static: false,
    grounded: false,
    rolling: false,
    lastGround: null,
    vx: 0.0,
    vy: 0.0,
    c: newCircle(x + w/2, y + h - h/4, h/4)
  }
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

  entity.c.x = entity.hitBox.x + entity.hitBox.w/2;
  entity.c.y = entity.hitBox.y + entity.hitBox.h - entity.c.r;
  // console.log(entity.c.r);

  entity.grounded = checkEntityTerrain(entity, delta);
  // if (onCollision != null){
  entities.forEach(e => {
    if (collides(entity, e) && entity != e){
      if (onCollision != null){
        onCollision(entity, e);
      }
      // console.log("collision");
      if (e.static){
        entity.vy = 0;
        entity.grounded = true;
        entity.hitBox.y = e.hitBox.y - entity.hitBox.h;
      }
    }
  });
  // }

  return
}

function drawEntity(entity, context){
  if (entity.img == null){
    context.fillRect(entity.hitBox.x, entity.hitBox.y, entity.hitBox.w, entity.hitBox.h);
  }else{
    context.drawImage(getSpriteFrame(entity.img, entity.frame), entity.hitBox.x, entity.hitBox.y);
  }
  context.beginPath();
  context.arc(entity.c.x, entity.c.y, entity.c.r, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  // context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
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
