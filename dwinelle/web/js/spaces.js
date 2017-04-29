function hallwayType1(length) {
  var space = new THREE.Group();
  space.add(makeArrowHelper(0,0,0,0,1,0));
  // Lighting
  for (var i = -length/2; i <= length/2; i+=5) {
    space.add(makePointLight(0,i,2.5, space));
  }
  // Floor
  space.add(makePlane(5  , length, 0   , 0   , 0 , null, null      , null, floorMat));
  // Left Wall
  space.add(makePlane(2.5, length, 2.5 , 0, 1.25, null, Math.PI/2 , null, paintMat));
  // Right Wall
  space.add(makePlane(2.5, length, -2.5, 0, 1.25, null, -Math.PI/2, null, paintMat));
  return space;
}