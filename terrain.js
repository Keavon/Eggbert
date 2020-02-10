
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

function curveBetween(l1, l2, segs = 10){
  var p0 = {x: l1.x2, y: l1.y2};
  var p1 = {x: l2.x1, y: l2.y1};
  var iP = lineIntersection(l1, l2); //intersection point
  var lastP = p0;
  //interpolate quadratic bezier curve
  for (var i = 0; i < segs; i++){
    var t = (i / segs);
    var it = 1 - t;
    var x = it * it * p0.x + 2 * it * t * iP.x + t * t * p1.x;
    var y = it * it * p0.y + 2 * it * t * iP.y + t * t * p1.y;
    terrain.push(newSegment(lastP.x, lastP.y, x, y));
    lastP.x = x;
    lastP.y = y;
  }
  terrain.push(newSegment(lastP.x, lastP.y, p1.x, p1.y));
}

function lineIntersection(l1, l2, inf = true){
  var a1 = l1.y2 - l1.y1;
  var b1 = l1.x1 - l1.x2;
  var c1 = a1*(l1.x1) + b1*(l1.y1);

  var a2 = l2.y2 - l2.y1;
  var b2 = l2.x1 - l2.x2;
  var c2 = a2*(l2.x1) + b2*(l2.y1);

  var det = a1 * b2 - a2 * b1;
  if (det == 0){
    return null;
  } else{
    return {
      x: (b2 * c1 - b1 * c2) / det,
      y: (a1 * c2 - a2 * c1) / det,
    };
  }
}

function drawTerrain(context, t){
  context.beginPath();
  context.moveTo(t.x1, t.y1);
  context.lineTo(t.x2, t.y2);
  context.stroke();
}

function checkEntityTerrain(e, delta){
  var ret = false;
  var closestP;
  var closestD = -1;
  var l;
  //find the closest terrain segment and point of contact
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
  //buffer the distance check if the entity is grounded, check a little extra
  var distCheck = e.grounded ? (e.c.r * e.c.r + WALK_SPEED/1.5) : (e.c.r * e.c.r);
  //check if the point is within the range check
  if (closestD != -1 && closestD < distCheck){
    e.debugP = closestP;
    //adjust entity position
    var dirX = closestP.x - e.c.x;
    var dirY = closestP.y - e.c.y;
    var dist = Math.sqrt(dirX * dirX + dirY * dirY) / e.c.r;
    //normalize to radius of circle
    e.c.x = closestP.x - dirX/dist;
    e.c.y = closestP.y - dirY/dist;
    e.hitBox.x = e.c.x - e.hitBox.w/2;
    e.hitBox.y = e.c.y + e.c.r - e.hitBox.h;
    //check collision is down and whether center of entity is over the segment
		ret = dirY > 0 && e.c.x >= l.x1 && e.c.x <= l.x2;
		if (dirY <= 0){
			e.vy = e.vy < 0 ? 0 : e.vy;
			return ret; //ceiling collision
		}
    //update rolling velocity
    if (e.rolling && (e.lastGround != l || !e.grounded)){
      //handle switching slopes and momentum transfer when entity lands on this
      //segment for the first time
      var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      var thetaL = Math.atan(l.slope);
      var thetaE = -Math.atan2(e.vy, e.vx);
      var speedTrans = (1.0 - Math.abs((thetaE - (thetaL)) / (Math.PI/2))) * 1.3;
      speedTrans = speedTrans.clamp(-1.0 , 1.0);
      e.vy = (speed * speedTrans) * Math.sin(Math.abs(thetaL)) * (l.slope > 0 ? -1 : 1);
      e.vx = (speed * speedTrans) * Math.cos(thetaL);
    } else if (e.rolling && e.grounded){
      //transfer verticle to horizontal each frame
      var speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      var theta = Math.atan(l.slope);
      var yChange = gravity * delta * -Math.sin(theta);
      if (l.slope != 0){
        e.vy += yChange * (l.slope > 0 ? -1 : 1);
        e.vx += yChange / l.slope * (l.slope < 0 ? -1 : 1);
      }
    }else if (!e.rolling){
      //no roll, just stop the entity from falling
      e.vy = 0;
    }
    //track the last terrain the entity was touching
    e.lastGround = l;
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
