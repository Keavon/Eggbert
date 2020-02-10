
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
    len: Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)),
    slope: (y1 - y2) / (x2 - x1),
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

function checkEntityTerrain(e, delta){
  var ret = false;
  var closestP;
  var closestD = -1;
  var l;
  terrain.forEach((line, i) => {
    //check if circle is between ends of line before checking distances
    if (e.c.x + e.c.r >= line.x1 && e.c.x - e.c.r <= line.x2){
      var cPoint = circleLineCollision(e.c, line);
      var d = Math.pow(cPoint.x - e.c.x, 2) + Math.pow(cPoint.y - e.c.y, 2);
      if (d < closestD || closestD == -1){
        closestD = d;
        closestP = cPoint;
        l = line;
      }
    }
  });
  var distCheck = e.grounded ? (e.c.r * e.c.r + WALK_SPEED/1.5) : (e.c.r * e.c.r);
  // console.log(distCheck);
  if (closestD != -1 && closestD < distCheck){
    // ret = true;
    e.debugP = closestP;
    //circle is too close to line
    var dirX = closestP.x - e.c.x;
    var dirY = closestP.y - e.c.y;//Math.abs(closestP.y - e.c.y);
    var dist = Math.sqrt(dirX * dirX + dirY * dirY) / e.c.r;
    //normalize to radius of circle
    e.c.x = closestP.x - dirX/dist;
    e.c.y = closestP.y - dirY/dist;
    e.hitBox.x = e.c.x - e.hitBox.w/2;
    e.hitBox.y = e.c.y + e.c.r - e.hitBox.h;
		ret = dirY > 0 && e.c.x >= l.x1 && e.c.x <= l.x2;
		if (dirY <= 0){
			e.vy = e.vy < 0 ? 0 : e.vy;
			return ret; //ceiling collision
		}
    //update rolling velocity
    if (e.rolling && (e.lastGround != l || !e.grounded)){
      //handle switching slopes and momentum transfer
      var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      // var vel = {x: e.vx, y: e.vy};
      // var slope = (l.y1 - l.y2) / (l.x2 - l.x1);
      // var slopeL = (e.lastGround.y1 - e.lastGround.y2) / (e.lastGround.x2 - e.lastGround.x1);
      var thetaL = Math.atan(l.slope);
      var thetaE = -Math.atan2(e.vy, e.vx);
      // var thetaL1 = Math.atan(slopeL);
      // console.log("thetaL", thetaL, "thetaE", thetaE, "thetaL1", thetaL);
      // console.log((Math.abs(thetaE) - Math.abs(thetaL)) / Math.PI/2);
      var speedTrans = (1.0 - Math.abs((thetaE - (thetaL)) / (Math.PI/2))) * 1.3;
      speedTrans = speedTrans.clamp(-1.0 , 1.0);
      // console.log(speedTrans);
      // console.log(theta);
      e.vy = (speed * speedTrans) * Math.sin(Math.abs(thetaL)) * (l.slope > 0 ? -1 : 1);
      e.vx = (speed * speedTrans) * Math.cos(thetaL);// * (slope > 0 ? -1 : 1);;// * (e.vx > 0 ? -1 : 1);// * (e.vx < 0 ? -1 : 1);// * (slope < 0 ? -1 : 1);// * (e.vx < 0 ? -1 : 1);
      // console.log("vx", e.vx, "vy", e.vy);
      // console.log(e.vy);
      // e.vx =
    } else if (e.rolling && e.grounded){
      //transfer verticle to horizontal
      var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      // var slope = (l.y1 - l.y2) / (l.x2 - l.x1);
      var theta = Math.atan(l.slope);
      var yChange = gravity * delta * -Math.sin(theta);
      if (l.slope != 0){
        e.vy += yChange * (l.slope > 0 ? -1 : 1);
        e.vx += yChange / l.slope * (l.slope < 0 ? -1 : 1);//* Math.cos(theta);// * (e.vx < 0 ? -1 : 1);
      }
    }else if (!e.rolling){
      e.vy = 0;
    }
    e.lastGround = l;
    // e.vy = e.rolling ? e.vy : 0;
  }
  return ret;

}

function closestPointOnLine(l, x, y){
  var dot = (((x-l.x1)*(l.x2-l.x1)) + ((y-l.y1)*(l.y2-l.y1))) / Math.pow(l.len, 2);
  return {
    x: (l.x1 + (dot * (l.x2 - l.x1))).clamp(l.x1, l.x2),
    y: (l.y1 + (dot * (l.y2 - l.y1))).clamp(Math.min(l.y1, l.y2), Math.max(l.y1, l.y2))
  };
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

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
