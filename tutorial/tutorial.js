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
var renderer = new THREE.WebGLRenderer();
var camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

var scene = new THREE.Scene();

// Add the camera to the scene.
scene.add(camera);

// Start the renderer.
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);
pointLight.position.set( 0, 1.5, -20 );

// add to the scene
scene.add(pointLight);

// create the sphere's material
var sphereMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });

// Set up the sphere vars
var RADIUS = 1;
var SEGMENTS = 4;
var RINGS = 4;

// Create a new mesh with
// sphere geometry - we will cover
// the sphereMaterial next!
var sphere = new THREE.Mesh(

  new THREE.SphereGeometry(
    RADIUS,
    SEGMENTS,
    RINGS),

  sphereMaterial);

// Move the Sphere back in Z so we
// can see it.
sphere.position.z = -15;

// Finally, add the sphere to the scene.
scene.add(sphere);


// // wireframe
// var geo = new THREE.EdgesGeometry( sphere.geometry ); // or WireframeGeometry
// var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
// var wireframe = new THREE.LineSegments( geo, mat );
// sphere.add( wireframe );

function addPlane(width, height, color, x, y, z, rotX, rotY, rotZ) {
  var geometry = new THREE.PlaneGeometry( width, height);
  var material = new THREE.MeshPhongMaterial( {color: color, side: THREE.DoubleSide} );
  var wall = new THREE.Mesh( geometry, material );
  scene.add( wall );

  if (x !== null) {
    wall.position.x = x;
  }
  if (y !== null) {
    wall.position.y = y;
  }
  if (z !== null) {
    wall.position.z = z;
  }
  if (rotX !== null) {
    wall.rotation.x = rotX;
  }
  if (rotY !== null) {
    wall.rotation.y = rotY;
  }
  if (rotZ !== null) {
    wall.rotation.z = rotZ;
  }
  var geo = new THREE.EdgesGeometry( wall.geometry ); // or WireframeGeometry
  var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  wall.add( wireframe );
}

addPlane(20, 2.5, 0xa03013, 2.5, null, -15, null, Math.PI/2, null);
addPlane(20, 2.5, 0x90302F, -2.5, null, -15, null, Math.PI/2, null);
addPlane(5, 20, 0xf0303D, null, -1.25, -15, Math.PI/2, null, null);

// Draw!
renderer.render(scene, camera);

function update () {
  // Draw!
  // sphere.position.x += 0.1;
  // sphere.rotation.y += Math.PI / 360;
  renderer.render(scene, camera);

  // Schedule the next frame.
  requestAnimationFrame(update);
}

// Schedule the first frame.
requestAnimationFrame(update);