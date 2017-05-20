(function(global) {

function Renderer() {
  this.camera = new THREE.PerspectiveCamera(90, 1, 0.5, 3000);
  this.scene = new THREE.Scene();
  this.renderer = new THREE.WebGLRenderer();

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: "#433F81" });
  var cube = new THREE.Mesh(geometry, material);

  this.renderer.setClearColor(new THREE.Color('green'));
}

global.Renderer = Renderer;

var _ = Renderer.prototype;

_.render = function() {
  this.renderer.render(this.scene, this.camera);
};

_.resize = function(w, h) {
  this.camera.aspect = w / h;
  this.renderer.setSize(w, h);
};

_.getDOMElement = function() {
  return this.renderer.domElement;
};

})(this);
