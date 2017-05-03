var material = new THREE.LineBasicMaterial({ color: 0x000000 });
var hilight = new THREE.LineBasicMaterial({ color: 0x0087C6, linewidth: 2 });
var faded = new THREE.LineBasicMaterial({ color: 0xbfbfbf });
var srcSphere = new THREE.MeshBasicMaterial({ color: 0x157e2d });
var dstSphere = new THREE.MeshBasicMaterial({ color: 0x7e1515 });

// New Materials

var paintMat = new THREE.MeshLambertMaterial( {color: 0xA8A280, side: THREE.BackSide} );
paintMat.polygonOffset = true;
paintMat.polygonOffsetFactor = -0.1;

var floorMat = new THREE.MeshPhongMaterial( {color: 0x42331F, side: THREE.FrontSide} );
floorMat.shininess = 110;
floorMat.polygonOffset = true;
floorMat.polygonOffsetFactor = -0.1;

var plainWhite = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
var plainLightGray = new THREE.MeshBasicMaterial({color: 0xF1F1F1, side: THREE.DoubleSide});
var plainDarkGray = new THREE.MeshBasicMaterial({color: 0xA9A9A9, side: THREE.DoubleSide});

var simplePaint = new THREE.MeshBasicMaterial({color: 0xA8A280, side: THREE.BackSide});
var simpleFloor = new THREE.MeshBasicMaterial({color: 0x42331F, side: THREE.DoubleSide});

var wireframe = new THREE.MeshBasicMaterial({color: 0xA8A280, side: THREE.BackSide, wireframe: true});

var dwinelle_tex;
// instantiate a loader

// var loader = new THREE.TextureLoader().load(
//   // resource URL
//   './dwinelle_env.jpg',
//   // Function when resource is loaded
//   function ( texture ) {
//     // do something with the texture
//     dwinelle_tex = new THREE.MeshBasicMaterial({map: texture});
//     dwinelle_tex.minFilter = THREE.LinearFilter;
//     dwinelle_tex.wrapS = THREE.RepeatWrapping;
//     dwinelle_tex.wrapT = THREE.RepeatWrapping;
//     dwinelle_tex.repeat.set( 4, 4 );
//   },
//   // Function called when download progresses
//   function ( xhr ) {
//     console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
//   },
//   // Function called when download errors
//   function ( xhr ) {
//     console.log( 'An error happened' );
//   }
// );

function makePhotoSphere() {
  var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(100, 32, 32), dwinelle_tex);
  sphere.scale.x = -1;
  console.log("sphere added!");
  return sphere;
}
