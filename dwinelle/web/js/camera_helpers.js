var WALKING_SPEED_RATIO = 30; // how many times faster than walking speed are you?
var FIRST_PERSON = false;
var RESET_CAMERA_POSITION = function() {camera.position.set(-168, 25, -17);}
var PATH_ANIMATION_RUNNING = false;

function startPathAnimation() {
    if (!PATH_ANIMATION_RUNNING) {
        var tween = nextCameraTween(currentPath, 0, currentSf, currentEf);
        updateScenePath(currentPath, currentSf, currentEf);
        PATH_ANIMATION_RUNNING = true;
        tween.start();
    } else {
        console.log("Animation already running");
    }
}

function endPathAnimation() {
    PATH_ANIMATION_RUNNING = false;
}

function nextCameraTween(path, index, sf, ef) {
    var start = convertVec(coords[path[index]]);
    var end = convertVec(coords[path[index+1]]);
    if (index === 0) {start = (new THREE.Vector3()).lerpVectors(start, end, sf);}
    if (index+1 === path.length - 1) {end = (new THREE.Vector3()).lerpVectors(start, end, 1-ef);}
    var tween = new TWEEN.Tween(start).to(end, 500+start.distanceTo(end)*1400/WALKING_SPEED_RATIO);
    tween.easing(TWEEN.Easing.Quadratic.InOut);
    var dir = (new THREE.Vector3()).subVectors(end, start).normalize();
    tween.onUpdate(function(){
        controls.target = start;
    });
    if (index === path.length - 2) {
        tween.onComplete(endPathAnimation);
        return tween;
    } else {
        return tween.chain(nextCameraTween(path,index+1, sf, ef));
    }
}

function toggleCamera() {
    if (FIRST_PERSON) {
        RESET_CAMERA_POSITION();
        controls.maxDistance = 100;
        FIRST_PERSON = false;
    } else {
        controls.maxDistance = 1;
        FIRST_PERSON = true;
    }
    updateScenePath(currentPath, currentSf, currentEf);
}