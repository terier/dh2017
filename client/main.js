(function() {

var renderer = new Renderer();

function render() {
  renderer.render();
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function update() {
  $.ajax('/data')
    .done(function(data) {
      console.log(data);
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