function Map(data) {
  this.walls = [];
  for (var i = 0; i < data.indices.length; i++) {
    var wall = data.indices[i];
    var v0 = data.vertices[wall[0]];
    var v1 = data.vertices[wall[1]];
    this.walls.push({
      from: new THREE.Vector2(v0[0], v0[1]),
      to:   new THREE.Vector2(v1[0], v1[1])
    });
  }
};

Map.prototype.intersections = function(from, to) {
  var ints = [];
  for (var i = 0; i < this.walls.length; i++) {
    var wall = this.walls[i];
    var int = Map.intersection(from, to, wall.from, wall.to);
    if (Map.intersects(int)) {
      ints.push({
        point: from.clone().add(to.clone().sub(from).multiplyScalar(int.y)),
        from: wall.from,
        to: wall.to,
        distance: int.y
      });
    }
  }
  ints.sort(function(a, b) {
    return a.distance - b.distance;
  });
  return ints;
};

Map.prototype.move = function(from, to) {
  var intersections = this.intersections(from, to);
  if (intersections.length === 0) {
    return to;
  }

  var int = intersections[0];
  var newto = Map.projectPoint(to, int.from, int.to);
  intersections = this.intersections(from, newto);
  if (intersections.length === 0) {
    return newto;
  }

  return intersections[0].point;
};

Map.wedge = function(a, b) {
  return a.x * b.y - b.x * a.y;
};

Map.intersection = function(a, b, c, d) {
  var e = b.clone().sub(a);
  var f = d.clone().sub(c);
  var s = c.clone().sub(a);
  var w = Map.wedge(e, f);
  var x = Map.wedge(s, e) / w;
  var y = Map.wedge(s, f) / w;
  return { x: x, y: y };
};

Map.intersects = function(result) {
  var x = result.x;
  var y = result.y;
  return x >= 0 && x <= 1 && y >= 0 && y <= 1;
}

Map.projectPoint = function(p, a, b) {
  var s = p.clone().sub(a);
  var e = b.clone().sub(a);
  return a.clone().add(e.multiplyScalar(s.dot(e) * 1.0001 / e.dot(e)));
};
