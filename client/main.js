$(function() {

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

});
