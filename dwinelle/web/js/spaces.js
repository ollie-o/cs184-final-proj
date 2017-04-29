function hallwayType1(length) {
  var space = new THREE.Group();
  space.add(makeArrowHelper(0,0,0,0,1,0));
  // Lighting
  for (var i = -length/2; i <= length/2; i+=10) {
    space.add(makePointLight(i,0,2.5, space));
  }
  // Floor
  space.add(makePlane(5  , length, 0, 0   , 0, null, null, Math.PI/2, floorMat));
  // Left Wall
  space.add(makePlane(2.5, length, 0,  2.5, 1.25, Math.PI/2, null, Math.PI/2, paintMat));
  // Right Wall
  space.add(makePlane(2.5, length, 0, -2.5, 1.25, -Math.PI/2, null, Math.PI/2, paintMat));
  return space;
}