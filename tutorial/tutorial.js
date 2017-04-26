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

var paintMat = new THREE.MeshLambertMaterial( {color: 0xA8A280, side: THREE.BackSide} );
var floorMat = new THREE.MeshPhongMaterial( {color: 0x42331F, side: THREE.DoubleSide} );
floorMat.shininess = 110;
var plainWhite = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});

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

function makePlane(width, height, x, y, z, rotX, rotY, rotZ, material) {
  var geometry = new THREE.PlaneGeometry( width, height);
  var mesh = new THREE.Mesh( geometry, material );
  if (x !== null) {mesh.position.x = x;}
  if (y !== null) {mesh.position.y = y;}
  if (z !== null) {mesh.position.z = z;}
  if (rotX !== null) {mesh.rotation.x = rotX;}
  if (rotY !== null) {mesh.rotation.y = rotY;}
  if (rotZ !== null) {mesh.rotation.z = rotZ;}
  return mesh;
}

function addHallway1(x,y,z,length) {
  scene.add(makePlane(length, 2.5, x+2.5, null, z, null, Math.PI/2, null, paintMat)); // Left wall
  scene.add(makePlane(length, 2.5, x-2.5, null, z, null, -Math.PI/2, null, paintMat)); // Right wall
  scene.add(makePlane(5, length, null, y-1.25, z, Math.PI/2, null, null, floorMat)); // Floor
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

function makeArrowHelper(ax, ay, az, bx, by, bz, length, hex) {
  var dir = new THREE.Vector3( bx, by, bz );
  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();
  var origin = new THREE.Vector3( ax, ay, az );
  return new THREE.ArrowHelper( dir, origin, length, hex);
}

var floor = null;
function addHallwayAsVector(ax, ay, az, bx, by, bz) {
  var length = Math.sqrt( Math.pow(ax-bx,2) + Math.pow(ay-by,2) + Math.pow(az-bz,2));
  var arrow = makeArrowHelper(ax, ay, az, bx, by, bz, length);
  console.log(arrow.rotation);
  var sceneElements = [arrow];
  // Floor
  floor = makePlane(5, length, 0, 0, 0, arrow.rotation.x, arrow.rotation.y + Math.PI / 2, arrow.rotation.z, floorMat);
  var arrowVector = new THREE.Vector3(bx, by, bz);
  // floor.lookAt(arrowVector);
  // floor.rotation.x = Math.PI / 2
  // floor.rotation.z = Math.PI / 2;

  sceneElements.push(floor);
  // var floor2 = makePlane(5, length, 0, 0, 0, Math.PI/4, Math.PI/2, null, plainWhite);
  // sceneElements.push(floor2);
  //
  for (var i = 0; i < sceneElements.length; i++) {
    scene.add(sceneElements[i]);
  }
}

// -------------------------------------------

// ORBIT CONTROLS
var controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.autoRotate = true;
// controls.maxDistance = 10;
// controls.maxPolarAngle = 0.4 * Math.PI;

// STATS (fps, memory, etc.)
var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );

function init() {
  for (var i = 0; i<21; i++) {
    addPointLight(0,1.5, -25*i, 0xFFFFFF);
  }
  // addHallway1(0,0,-10,20);
  scene.add(makeArrowHelper(0, 0, 0, 0, 0, 1, 2, 0x325EFF));
  scene.add(makeArrowHelper(0, 0, 0, 0, 1, 0, 2, 0x7F4B05));
  scene.add(makeArrowHelper(0, 0, 0, 1, 0, 0, 2, 0x000000));
  //
  addHallwayAsVector(0, 0, 0, 12, 7, -2);
  render();
}

var z = -5;
var increment = 1.1;
var mesh_just_added;
function update () {
  stats.begin();
  // floor.rotation.z += 0.01;
  render();
  controls.update();
  stats.end();
  requestAnimationFrame(update);
}

function render() {
  renderer.render(scene, camera);
}


// Schedule the first frame.
init();
requestAnimationFrame(update);