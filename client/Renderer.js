(function(global) {

function Renderer() {
  this.camera = new THREE.PerspectiveCamera(75, 1, 0.5, 3000);
  this.scene = new THREE.Scene();
  this.renderer = new THREE.WebGLRenderer();

  this.renderer.setClearColor(new THREE.Color('#fffeef'));

  this.light = new THREE.DirectionalLight(0xffffff, 2);
  this.light.position.set(100, 300, -100);
  this.light.target = new THREE.Object3D();
  this.scene.add(this.light);

  //var grid = new THREE.GridHelper(2000, 100, new THREE.Color('#ff00ff'), new THREE.Color('#ffccaa'));
  //this.scene.add(grid);
  this.terrain = new Terrain(30, 100, 0.001, 2000);
  for (var i = 0; i < this.terrain.meshes.length; i++) {
    this.scene.add(this.terrain.meshes[i]);
  }

  var skygeo = new THREE.SphereGeometry(3000, 60, 40);
  var skymat = new THREE.MeshBasicMaterial({
    depthTest: true,
    depthWrite: false
  });
  skymat.map = THREE.ImageUtils.loadTexture('assets/sky.jpg');
  skymat.side = THREE.BackSide;
  this.skydome = new THREE.Mesh(skygeo, skymat);
  this.scene.add(this.skydome);

  this.camera.position.set(100, 300, 300);
  var controls = new THREE.OrbitControls(this.camera);
}

global.Renderer = Renderer;

var _ = Renderer.prototype;

_.render = function() {
  this.skydome.position.copy(this.camera.position);
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
