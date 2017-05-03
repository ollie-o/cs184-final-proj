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
  // X-Y-Z marker
  scene.add(makeArrowHelper(0, 0, 0, 0, 0, 1, 2, 0x325EFF));
  scene.add(makeArrowHelper(0, 0, 0, 0, 1, 0, 2, 0x7F4B05));
  scene.add(makeArrowHelper(0, 0, 0, 1, 0, 0, 2, 0x000000));
  // Testing
  // scene.add(makeSpaceAsVector(0, 0, 0, 0, 0, -20, hallwayType1_realistic));
  // scene.add(makeSpaceAsVector(-12, 0, -9, 12, 7, -2, hallwayType1_realistic));
  scene.add(makeSpaceAsVector(-75, 25, -130, -54, 25, -130, hallwayType1_realistic));
  scene.add(makeSpaceAsVector(-75, 25, -130, -75, 10, -100, hallwayType1_realistic));

  camera.position.set(-75, 35, -130);
  controls.target = new THREE.Vector3(-75, 25, -130);
  render();
}

function update () {
  stats.begin();
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