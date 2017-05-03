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

// ----------- Made for dwinelle_vis.js --------

function convertVec(vec) {
    return convertCoords(vec.x, vec.y, vec.z);
}

function convertCoords(x, y, z) {
    // The data was recorded with z representing UP
    // 3d rendering uses y as the up direction by convention
    var SHRINK = 610;
    var X_OFFSET = 0;
    var Y_OFFSET = -100;
    var Z_SHRINK = 1000;
    var Z_OFFSET = -35;
    return new THREE.Vector3(x / SHRINK + X_OFFSET,
        z / Z_SHRINK + Z_OFFSET,
        -(y / SHRINK + Y_OFFSET));
}

function makeSpace(ax, ay, az, bx, by, bz, spaceFn) {
    var a = convertCoords(ax, ay, az);
    var b = convertCoords(bx, by, bz);
    return makeSpaceAsVector(a.x, a.y, a.z, b.x, b.y, b.z, spaceFn);
}

function makePath(ap, bp, m) {
  if (FIRST_PERSON) {
    return makeLine(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, m);
  } else {
    return makeCylinder(ap, bp, m);
  }
}

function makeLine(ax, ay, az, bx, by, bz, m) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(convertCoords(ax, ay, az));
  geometry.vertices.push(convertCoords(bx, by, bz));
  return new THREE.Line(geometry, m);
}

function makeCylinder(pointX, pointY, material) {
  // http://stackoverflow.com/questions/15316127/three-js-line-vector-to-cylinder
  var pointX = convertVec(pointX);
  var pointY = convertVec(pointY);
  var direction = new THREE.Vector3().subVectors(pointY, pointX);
  var orientation = new THREE.Matrix4();
  orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
  orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
      0, 0, 1, 0,
      0, -1, 0, 0,
      0, 0, 0, 1));
  var edgeGeometry = new THREE.CylinderGeometry(0.2, 0.2, direction.length(), 8, 1);
  var edge = new THREE.Mesh(edgeGeometry, material);
  edge.applyMatrix(orientation);
  // position based on midpoints - there may be a better solution than this
  edge.position.x = (pointY.x + pointX.x) / 2;
  edge.position.y = (pointY.y + pointX.y) / 2;
  edge.position.z = (pointY.z + pointX.z) / 2;
  return edge;
}

// Since edges can occur mid-way along an edge,
// lerping is necessary!
// Current edge is start of path
//          1-sf      sf
//     ap ------- mp ------> bp    (ai === 0)
//     bp ------- mp ------> ap    (bi === 0)
// Current edge is end of path
//          ef        1-ef
//     bp ------- mp ------> ap    (ai === path.length - 1)
//     ap ------- mp ------> bp    (bi === path.length - 1)
// When we call splitLine()
//     ap ------- mp ------> bp    (abstracted)

// Current edge is start and end of path
//         sf                 ef
//     ap ----- m1 ----> m2 ----- bp    (bi === 1)
//     bp ----- m1 ----> m2 ----- ap    (bi === 0)
// When we call tripleSplit()
//     ap ----- m1 ----> m2 ----- bp    (abstracted)

function splitLine(ap, bp, fraction, line1, line2, space1, space2, sphereType) {
    // Assumes direction     ap --- m --> bp
    var meshes = new THREE.Group();
    var mp = (new THREE.Vector3()).lerpVectors(ap,bp,fraction);

    meshes.add(endSphere(mp.x, mp.y, mp.z, sphereType));
    meshes.add(makeSpace(ap.x, ap.y, ap.z, mp.x, mp.y, mp.z, space1));

    meshes.add(makePath(mp, bp, line2));
    // meshes.add(makeLine(mp.x, mp.y, mp.z, bp.x, bp.y, bp.z, line2));
    meshes.add(makeSpace(mp.x, mp.y, mp.z, bp.x, bp.y, bp.z, space2));
    return meshes;
}

// needed when the source and destination are on the same edge
function tripleSplit(ap, bp, f1, f2, line1, line2, space1, space2) {
    // Assumes going in direction A --> B
    var meshes = new THREE.Group();
    if (f1 > f2) {
        f1 = 1 - f1;
        f2 = 1 - f2;
    }
    var m1 = (new THREE.Vector3()).lerpVectors(ap,bp,f1);
    var m2 = (new THREE.Vector3()).lerpVectors(ap,bp,f2);

    meshes.add(makeSpace(ap.x, ap.y, ap.z, m1.x, m1.y, m1.z, space1));
    meshes.add(endSphere(m1.x, m1.y, m1.z, srcSphere));

    meshes.add(makePath(m1, m2, line2));
    // meshes.add(makeLine(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z, line2));
    meshes.add(makeSpace(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z, space2));

    meshes.add(endSphere(m2.x, m2.y, m2.z, dstSphere));
    meshes.add(makeSpace(m2.x, m2.y, m2.z, bp.x, bp.y, bp.z, space1));

    return meshes;
}

function endSphereLerp(ap, bp, fraction, m) {
    var mp = (new THREE.Vector3()).lerpVectors(ap,bp,fraction);

    var geometry = new THREE.SphereGeometry(0.5);
    var sphere = new THREE.Mesh(geometry, m);
    sphere.position.copy(convertVec(mp));
    return sphere;
}

function endSphere(x, y, z, m) {
    var geometry = new THREE.SphereGeometry(1);
    var sphere = new THREE.Mesh(geometry, m);
    sphere.position.copy(convertCoords(x, y, z));
    return sphere;
}

function edgeOnPath(ai,bi) {
    return ai >= 0 && bi >= 0 && Math.abs(ai - bi) === 1;
}

function lineNeedsSplitting(path, ai, bi) {
    return (path.length === 2) || (ai === 0) || (ai === path.length - 1) || (bi === 0) || (bi === path.length - 1);
}

// Env Sphere!

function makeEnvSphere(fname) {
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 20, 20),
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('./js/dwinelle_env.jpg')
    })
  );
  sphere.scale.x = -1;
  return sphere;
}
