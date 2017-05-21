function Terrain(segments, amplitude, frequency, size) {
  this.segments = segments;
  this.amplitude = amplitude;
  this.frequency = frequency;
  this.size = size;
  this.data = [];
  this.geometry = new THREE.PlaneGeometry(size, size, segments - 1, segments - 1);
  this.geometry.rotateX(-Math.PI / 2);
  this.geometry.rotateY(Math.PI / 2);
  for (var j = 0; j < segments; j++) {
    for (var i = 0; i < segments; i++) {
      var vert = this.geometry.vertices[i + j * segments];
      vert.y = this.getHeight(vert.x, vert.z);
    }
  }
  var texture = new THREE.CanvasTexture(this.generateTexture());
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  //texture.generateMipmaps = false;
  var textureScale = 0.01;
  texture.repeat.set(size * textureScale, size * textureScale);
  this.meshes = [];

  var grass = THREE.ImageUtils.loadTexture('assets/grass.jpg');
  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(size * textureScale, size * textureScale);
  var mat = new THREE.MeshLambertMaterial({
    map: grass
  });
  this.meshes.push(new THREE.Mesh(this.geometry, mat));
  for (var i = 0; i < 10; i++) {
    var material = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.3, 0.75, (i / 10) * 0.4 + 0.1),
      map: texture,
      transparent: true
    });
    var mesh = new THREE.Mesh(this.geometry, material);
    mesh.position.y += (i + 1) * 0.5;
    this.meshes.push(mesh);
  }
}

Terrain.prototype.generateTexture = function() {
  var canvas = document.createElement( 'canvas' );
  canvas.width = 512;
  canvas.height = 512;
  var context = canvas.getContext('2d');
  for (var i = 0; i < 20000; i++) {
    context.fillStyle = 'hsl(0,0%,' + ( Math.random() * 50 + 50) + '%)';
    context.beginPath();
    context.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() + 0.15, 0, Math.PI * 2, true);
    context.fill();
  }
  context.globalAlpha = 0.075;
  context.globalCompositeOperation = 'lighter';
  return canvas;
}

Terrain.prototype.getHeight = function(x, y) {
  return noise.simplex2(x * this.frequency, y * this.frequency) * this.amplitude;
}
