function nextCameraTween(path, index, sf, ef) {
    var start = convertVec(coords[path[index]]);
    var end = convertVec(coords[path[index+1]]);
    if (index === 0) {start = (new THREE.Vector3()).lerpVectors(start, end, sf);}
    if (index+1 === path.length - 1) {end = (new THREE.Vector3()).lerpVectors(start, end, 1-ef);}
    var tween = new TWEEN.Tween(start).to(end, start.distanceTo(end)*1400/WALKING_SPEED_RATIO);
    tween.easing(TWEEN.Easing.Quadratic.InOut);
    var dir = (new THREE.Vector3()).subVectors(end, start).normalize();
    tween.onUpdate(function(){
        controls.target = start;
    });
    if (index === path.length - 2) {
        return tween;
    } else {
        return tween.chain(nextCameraTween(path,index+1, sf, ef));
    }
}