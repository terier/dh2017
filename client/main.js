(function() {

var renderer = new Renderer();
var userSize = 10;

var users = {};

function render() {
  Object.keys(users).forEach(function(id) {
    var user = users[id];
    user._visual.position.set(user.x, userSize / 2, user.y);
    renderer.scene.add(user._visual);
  });
  renderer.render();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

var userGeometry = new THREE.BoxGeometry(userSize, userSize, userSize);

function createUserVisual() {
  var color = new THREE.Color(0xffffff);
  color.setHex(Math.random() * 0xffffff);
  var material = new THREE.MeshBasicMaterial({
    color: color
  });
  var mesh = new THREE.Mesh(userGeometry, material);
  return mesh;
}

function update() {
  Object.keys(users).forEach(function(user) {
    user._updated = false;
  });
  $.ajax('/data')
    .done(function(data) {
      var u = data.users;
      u.forEach(function(user) {
        if (user._id in users) {
          users[user._id].x = user.x;
          users[user._id].y = user.y;
          users[user._id]._updated = true;
        } else {
          users[user._id] = user;
          users[user._id]._updated = true;
          users[user._id]._visual = createUserVisual();
        }
      });
    });
  Object.keys(users).forEach(function(id) {
    if (!users[id]._updated) {
      renderer.scene.remove(users[id]._visual);
      delete users[id];
    }
  });
}

var updateInterval = 1000;
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