// Set the scene size.
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

// Set some camera attributes.
var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 0.1;
var FAR = 10000;

// Get the DOM element to attach to
var container =
    document.getElementById('container');

// Create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0x828282, 1);

var camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

camera.position.set(0, 1.5, 10);

var scene = new THREE.Scene();

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// // wireframe
// var geo = new THREE.EdgesGeometry( sphere.geometry ); // or WireframeGeometry
// var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
// var wireframe = new THREE.LineSegments( geo, mat );
// sphere.add( wireframe );

function addSphere(radius, segments, rings, color, x, y, z) {
  // create the sphere's material
  var sphereMaterial =
    new THREE.MeshLambertMaterial(
      {
        color: 0xCC0000
      });

  // Create a new mesh with
  // sphere geometry - we will cover
  // the sphereMaterial next!
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      segments,
      rings),
    sphereMaterial);
  if (x !== null) {sphere.position.x = x;}
  if (y !== null) {sphere.position.y = y;}
  if (z !== null) {sphere.position.z = z;}
  // Finally, add the sphere to the scene.
  scene.add(sphere);
}

function addPlane(width, height, color, x, y, z, rotX, rotY, rotZ) {
  var geometry = new THREE.PlaneGeometry( width, height);
  var material = new THREE.MeshPhongMaterial( {color: color, side: THREE.DoubleSide} );
  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  if (x !== null) {mesh.position.x = x;}
  if (y !== null) {mesh.position.y = y;}
  if (z !== null) {mesh.position.z = z;}
  if (rotX !== null) {mesh.rotation.x = rotX;}
  if (rotY !== null) {mesh.rotation.y = rotY;}
  if (rotZ !== null) {mesh.rotation.z = rotZ;}
  return mesh;
}

function addHallway1(x,y,z,length) {
  addPlane(length, 2.5, 0xa03013, x+2.5, null, z, null, Math.PI/2, null);
  addPlane(length, 2.5, 0x90302F, x-2.5, null, z, null, Math.PI/2, null);
  return addPlane(5, length, 0xf0303D, null, y-1.25, z, Math.PI/2, null, null);
}

function addPointLight(x,y,z, color) {
  // create a point light
  var pointLight = new THREE.PointLight(color);
  if (x !== null) {pointLight.position.x = x;}
  if (y !== null) {pointLight.position.y = y;}
  if (z !== null) {pointLight.position.z = z;}
  // add to the scene
  scene.add(pointLight);
}

// -------------------------------------------

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;
controls.maxDistance = 10;

function init() {
  for (i = 0; i<21; i++) {
    addPointLight(0,1.5, -50*i-7, 0xFFFFFF);
  }
  render();
}

var z = -5;
var increment = 1.1;
var mesh_just_added;
function update () {
  render();
  if (-z < 1000) {
    // Add geometry
    mesh_just_added = addHallway1(0,0,z,Math.log(increment));
    controls.target.copy(mesh_just_added.position);
    camera.position.y += 1.25;
    z -= Math.log(increment);
    increment += 0.1;
  }
  requestAnimationFrame(update);
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}


// Schedule the first frame.
init();
requestAnimationFrame(update);