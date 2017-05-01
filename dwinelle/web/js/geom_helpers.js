// Shape Constructors

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

function addArrowHelper(ax, ay, az, bx, by, bz, length, hex) {
  if (hex === undefined) {hex = 0x325EFF;}
  if (length === undefined) {length = Math.sqrt( Math.pow(ax-bx,2) + Math.pow(ay-by,2) + Math.pow(az-bz,2));}
  var dir = new THREE.Vector3( bx-ax, by-ay, bz-az );
  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();
  var origin = new THREE.Vector3( ax, ay, az );
  scene.add(new THREE.ArrowHelper( dir, origin, length, hex));
}

function makeArrowHelper(ax, ay, az, bx, by, bz, length, hex) {
  if (hex === undefined) {hex = 0x325EFF;}
  if (length === undefined) {length = Math.sqrt( Math.pow(ax-bx,2) + Math.pow(ay-by,2) + Math.pow(az-bz,2));}
  var dir = new THREE.Vector3( bx-ax, by-ay, bz-az );
  //normalize the direction vector (convert to vector of length 1)
  dir.normalize();
  var origin = new THREE.Vector3( ax, ay, az );
  return new THREE.ArrowHelper( dir, origin, length, hex);
}

// Lights!

function addPointLight(x,y,z, color) {
  // create a point light
  var pointLight = new THREE.S(color);
  if (x !== null) {pointLight.position.x = x;}
  if (y !== null) {pointLight.position.y = y;}
  if (z !== null) {pointLight.position.z = z;}
  // add to the scene
  scene.add(pointLight);
}

function makePointLight(x,y,z,target,color) {
  // create a point light (color optional, defaults to 0xffffff)
  var pointLight = new THREE.PointLight(color, 2.5);
  pointLight.distance = 7;
  pointLight.decay = 2;
  if (target !== null) {pointLight.target = target;}
  if (x !== null) {pointLight.position.x = x;}
  if (y !== null) {pointLight.position.y = y;}
  if (z !== null) {pointLight.position.z = z;}
  // add to the scene
  return pointLight;
}

// Vector ---> Geometry Helpers

function getPlaneCenterFromVector(A, B) {
  // Returns PLANECENTER, a point directly below the midpoint
  // Returns LOOKAT, the point along A,B that the plane's normal
  //         needs to point to for it to be perpendicular to AB
  // mid point
  var mx = (A.x+B.x)/2.0;
  var my = (A.y+B.y)/2.0;
  var mz = (A.z+B.z)/2.0;
  var M = new THREE.Vector3(mx, my, mz);
  // direction
  var AM = new THREE.Vector3().subVectors( M, A ); // not normalized
  var dir = AM.clone().normalize(); // normalized
  // We now generate other points (see diagram)
  var M_planeCenter_len = 1.25;
  var planeCenter = new THREE.Vector3().subVectors( M, new THREE.Vector3(0,M_planeCenter_len,0) );
  var m_lookAt_len = - dir.y * M_planeCenter_len; // dir.y is equiv. to cos(theta) == CM.dot(CP) == (0,-1,0).dot(AB.normalized())
  var lookAt = new THREE.Vector3().addVectors( M, dir.clone().multiplyScalar(m_lookAt_len) );
  // Guide lines for debugging
  // addArrowHelper(planeCenter.x, planeCenter.y, planeCenter.z, lookAt.x, lookAt.y, lookAt.z, undefined, 0xffff00);
  // addArrowHelper(planeCenter.x, planeCenter.y, planeCenter.z, mx, my, mz, undefined, 0xffff00);
  // addArrowHelper(A.x, A.y, A.z, B.x, B.y, B.z, undefined, 0xffff00);
  // addArrowHelper(B.x, B.y, B.z, planeCenter.x, planeCenter.y, planeCenter.z, undefined, 0xffff00);
  return [planeCenter, lookAt, dir];
}

function makeSpaceAsVector(ax, ay, az, bx, by, bz, spaceFn) {
  var length = Math.sqrt( Math.pow(ax-bx,2) + Math.pow(ay-by,2) + Math.pow(az-bz,2));
  // Calculate orientation for floor
  var useful_vals = getPlaneCenterFromVector(new THREE.Vector3(ax, ay, az), new THREE.Vector3(bx, by, bz));
  var planeCenter = useful_vals[0];
  var lookAt = useful_vals[1];
  var dir = useful_vals[2];
  // Space
  var space = spaceFn(length);
  space.position.set(planeCenter.x,planeCenter.y,planeCenter.z);
  space.updateMatrixWorld();  // Get the "up" vector to look along vector
  space.up = planeCenter.add(space.worldToLocal(dir)).normalize();
  space.lookAt(lookAt);
  return space;
}