(function(global) {

function Renderer() {
  this.camera = new THREE.PerspectiveCamera(75, 1, 0.5, 3000);
  this.scene = new THREE.Scene();
  this.renderer = new THREE.WebGLRenderer();

  this.renderer.setClearColor(new THREE.Color('#fffeef'));

  var grid = new THREE.GridHelper(2000, 100, new THREE.Color('#ff00ff'), new THREE.Color('#ffccaa'));
  this.scene.add(grid);

  this.camera.position.set(100, 300, 300);
  var controls = new THREE.OrbitControls(this.camera);
}

global.Renderer = Renderer;

var _ = Renderer.prototype;

_.render = function() {
  this.renderer.render(this.scene, this.camera);
};

_.resize = function(w, h) {
  this.camera.aspect = w / h;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(w, h);
};

_.getDOMElement = function() {
  return this.renderer.domElement;
};

})(this);
