// Camera stuff

function toggleCamera() {
    if (FIRST_PERSON) {
        RESET_CAMERA_POSITION();
        controls.maxDistance = 100;
        FIRST_PERSON = false;
    } else {
        controls.maxDistance = 1;
        FIRST_PERSON = true;
    }
    removeClassById("togglecameratopright", "pulse");
    updateScenePath(currentPath, currentSf, currentEf);
}

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

function updateWalkingSpeed() {
  WALKING_SPEED_RATIO = document.getElementById("walkingspeed").value;
  document.getElementById("animspeed").innerHTML = WALKING_SPEED_RATIO;
}

// Navigation stuff

function onChoiceChange() {
    var src = srcChoice.getValue(true);
    var dst = dstChoice.getValue(true);

    if (!src || !dst) {
        updateScenePath([]);
        history.replaceState("", document.title, window.location.pathname
            + window.location.search);
        return;
    }

    displayNoneDiv("noPathError");

    window.location.hash = ('src=' + encodeURIComponent(src)
        + '&dst=' + encodeURIComponent(dst));

    var foundPath = findPath(src, dst);
    dlist = directionList(foundPath.path, src, dst, foundPath.endEdge);
    console.log(directionList(foundPath.path, src, dst, foundPath.endEdge));
    console.log(foundPath);
    putDirections(dlist, foundPath.totalDist / 1000);

    var startFrac = foundPath.startEdge.t;
    if (foundPath.startEdge.a !== foundPath.path[0]) {
        startFrac = 1 - startFrac;
    }

    var endFrac = foundPath.endEdge.t;
    if (foundPath.endEdge.a !== foundPath.path[foundPath.path.length - 1]) {
        endFrac = 1 - endFrac;
    }
    updateScenePath(foundPath.path, startFrac, endFrac);
}

// UI Stuff

function swapButton() {
    var src = srcChoice.getValue(true);
    var dst = dstChoice.getValue(true);
    console.log(src, dst);

    if (dstChoice.presetChoices.some(findChoice(src)) &&
        srcChoice.presetChoices.some(findChoice(dst))) {
        srcChoice.setValueByChoice(dst);
        dstChoice.setValueByChoice(src);
        onChoiceChange();
    }
}

function clearButton() {
    srcChoice.setValueByChoice('');
    dstChoice.setValueByChoice('');
    onChoiceChange();
    currentPath = [];
    currentSf = 1;
    currentEf = 1;
    controls.autoRotate = true;
}

function goButton() {
  var src = srcChoice.getValue(true);
  var dst = dstChoice.getValue(true);
  if (!src || !dst) {
    displayBlockDiv("noPathError");
  } else {
    controls.autoRotate = false;
    toggleControls();
    startPathAnimation()
    displayNoneDiv("noPathError");
  }
}

function toggleControls() {
  // show one, hide the other
  toggleDiv('container');
  toggleDiv('togglecameratopright');
}

function displayNoneDiv(name) {
  var div = document.getElementById(name);
  div.style.display = 'none';
}

function displayBlockDiv(name) {
  var div = document.getElementById(name);
  div.style.display = 'block';
}

function toggleDiv(name) {
  var div = document.getElementById(name);
  if (div.style.display !== 'none') {
    div.style.display = 'none';
  }
  else {
    div.style.display = 'block';
  }
}

function removeClassById(name, className) {
  var active = document.getElementById(name);
  active.classList.remove(className);
}