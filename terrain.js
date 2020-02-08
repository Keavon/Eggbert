
let terrain = [];

function newCircle(x, y, r){
  return {
    x: x,
    y: y,
    r: r
  };
}

function newSegment(x1, y1, x2, y2){
  return {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    len: Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))
  };
}

function drawTerrain(context, t){
  // context.lineWidth = 3;
  context.beginPath();
  context.moveTo(t.x1, t.y1);
  context.lineTo(t.x2, t.y2);
  // console.log(t);
  // context.closePath();
  context.stroke();
}

function checkEntityTerrain(e){
  var ret = false;
  terrain.forEach((line, i) => {
    //check if circle is between ends of line before checking distances
    if (e.c.x - e.c.r >= line.x1 && e.c.x + e.c.r <= line.x2){
      var cPoint = circleLineCollision(e.c, line);
      // console.log(cPoint);
      var distCheck = e.grounded ? (e.c.r * e.c.r + 15) : (e.c.r * e.c.r);
      // console.log(distCheck);
      if (Math.pow(cPoint.x - e.c.x, 2) + Math.pow(cPoint.y - e.c.y, 2) < distCheck){
        ret = true;
        //circle is too close to line
        var dirX = cPoint.x - e.c.x;
        var dirY = Math.abs(cPoint.y - e.c.y);
        var dist = Math.sqrt(dirX * dirX + dirY*dirY) / e.c.r;
        //normalize to radius of circle
        e.c.x = cPoint.x - dirX/dist;
        e.c.y = cPoint.y - dirY/dist;
        // e.hitBox.x = cPoint.x - dirX/dist - (e.c.x - e.hitBox.x);
        // e.hitBox.y = cPoint.y - dirY/dist - (e.c.y - e.hitBox.y);
        e.hitBox.x = e.c.x - e.hitBox.w/2;
        e.hitBox.y = e.c.y + e.c.r - e.hitBox.h;

        // e.grounded = true;
        e.vy = 0;
        // console.log("connect");
      }
    }
  });
  return ret;

}

function closestPointOnLine(l, x, y){
  var dot = (((x-l.x1)*(l.x2-l.x1)) + ((y-l.y1)*(l.y2-l.y1))) / Math.pow(l.len, 2);
  return {
    x: l.x1 + (dot * (l.x2 - l.x1)),
    y: l.y1 + (dot * (l.y2 - l.y1))
  };
}

function circleLineCollision(c, l){
  // if (pointCircleCollision(c, l.x1, l.y1) ||
  //     pointCircleCollision(c, l.x2, l.y2)){
  //     return true;
  // }
  return closestPointOnLine(l, c.x, c.y);
}

function pointCircleCollision(c, x, y){
  if (Math.pow(c.x - x, 2) + Math.pow(c.y - y, 2) <= c.r*c.r){
    return true;
  }
}
