var WALKING_SPEED_RATIO = 30; // how many times faster than walking speed are you?
var FIRST_PERSON = false;
var RESET_CAMERA_POSITION = function() {camera.position.set(-300, 180, 180);}

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

function toggleCamera() {
    if (FIRST_PERSON) {
        console.log("switch to 3rd person");
        RESET_CAMERA_POSITION();
        controls.maxDistance = 100;
        FIRST_PERSON = false;
    } else {
        controls.maxDistance = 1;
        FIRST_PERSON = true;
    }
}