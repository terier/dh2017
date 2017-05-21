(function() {

var renderer = new Renderer();
var userSize = 10;

var users = window.users = {};

function render() {
  Object.keys(users).forEach(function(id) {
    var user = users[id];
    var oldx = user._visual.position.x;
    var oldy = user._visual.position.z;
    var newx = user.x;
    var newy = user.y;
    var smooth = 0.97;
    var x = newx - (newx - oldx) * smooth;
    var y = newy - (newy - oldy) * smooth;
    var z = renderer.terrain.getHeight(x, y);
    user._visual.position.set(x, z + userSize / 2, y);
    renderer.scene.add(user._visual);
  });
  renderer.render();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

var userGeometry = new THREE.SphereGeometry(userSize, 32, 64);

function createUserVisual(text) {
  var color = new THREE.Color(0xffffff);
  color.setHex(Math.random() * 0xffffff);
  var material = new THREE.MeshLambertMaterial({
    color: color
  });
  var mesh = new THREE.Mesh(userGeometry, material);
  var textnode = new TextNode(text, mesh);
  return mesh;
}

function update() {
  $.ajax('/data')
    .done(function(data) {
      Object.keys(users).forEach(function(id) {
        users[id]._updated = false;
      });
      var u = data.users;
      u.forEach(function(user) {
        if (user._id in users) {
          users[user._id].x = user.x;
          users[user._id].y = user.y;
          users[user._id]._updated = true;
        } else {
          users[user._id] = user;
          users[user._id]._updated = true;
          users[user._id]._visual = createUserVisual(user.name);
        }
      });

      Object.keys(users).forEach(function(id) {
        if (!users[id]._updated) {
          renderer.scene.remove(users[id]._visual);
          delete users[id];
        }
      });
    });
}

var updateInterval = 400;
var t0 = Date.now();

function ticker() {
  var t = Date.now();
  var dt = t - t0;
  if (dt > updateInterval) {
    t0 = t;
    update();
  }
  requestAnimationFrame(ticker);
}

requestAnimationFrame(ticker);

$(function() {
  document.body.appendChild(renderer.getDOMElement());
  renderer.resize(window.innerWidth, window.innerHeight);
});

$(window).resize(function() {
  renderer.resize(window.innerWidth, window.innerHeight);
});

})();