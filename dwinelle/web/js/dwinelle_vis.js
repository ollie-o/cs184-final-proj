// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
// This file is part of Dwinelle Navigator.

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Dwinelle Navigator is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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

function makeLine(ax, ay, az, bx, by, bz, m) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(convertCoords(ax, ay, az));
    geometry.vertices.push(convertCoords(bx, by, bz));
    return new THREE.Line(geometry, m);
}

// Since edges can occur mid-way along an edge,
// lerping is necessary!
// Current edge is start of path
//          1-sf      sf
//     ap ------- m ------> bp    (ai === 0)
//     bp ------- m ------> ap    (bi === 0)
// Current edge is end of path
//          ef        1-ef
//     bp ------- m ------> ap    (ai === path.length - 1)
//     ap ------- m ------> bp    (bi === path.length - 1)
// When we call splitLine()
//     ap ------- m ------> bp    (abstracted)

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

    meshes.add(makeLine(mp.x, mp.y, mp.z, bp.x, bp.y, bp.z, line2));
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

    meshes.add(makeLine(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z, line2));
    meshes.add(makeSpace(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z, space2));

    meshes.add(endSphere(m2.x, m2.y, m2.z, dstSphere));
    meshes.add(makeSpace(m2.x, m2.y, m2.z, bp.x, bp.y, bp.z, space1));

    return meshes;
}

function endSphereLerp(ap, bp, fraction, m) {
    var mp = (new THREE.Vector3()).lerpVectors(ap,bp,fraction);

    var geometry = new THREE.SphereGeometry(1);
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

var oldPath = {};
var oldEdges = {};
function initScene() {
    scene.background = new THREE.Color(0xffffff);
    for (var edge_str in el) {
        oldPath[edge_str] = false;
        var s = edge_str.split(' ');
        var a = parseInt(s[0], 10);
        var b = parseInt(s[1], 10);
        var ap = coords[a];
        var bp = coords[b];
        var edgeGroup = new THREE.Group();
        edgeGroup.name = edge_str;
        edgeGroup.add(makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hallwayType1_simple));
        oldEdges[edge_str] = edgeGroup;
        scene.add(edgeGroup);
    }
}

function edgeOnPath(ai,bi) {
    return ai >= 0 && bi >= 0 && Math.abs(ai - bi) === 1;
}

function lineNeedsSplitting(path, ai, bi) {
    return (path.length === 2) || (ai === 0) || (ai === path.length - 1) || (bi === 0) || (bi === path.length - 1);
}

function updateScenePath(path, sf, ef) {
    // Returns a scene containing the full path
    for (var edge_str in el) {
        var s = edge_str.split(' ');
        var a = parseInt(s[0], 10);
        var b = parseInt(s[1], 10);

        var ap = coords[a];
        var bp = coords[b];

        var ai = path.indexOf(a);
        var bi = path.indexOf(b);

        var spaceFn = hallwayType1_simple;
        var pathSpaceFn = hallwayType1_realistic;

        var edgeGroup = new THREE.Group();
        var prevEdgeGroup = oldEdges[edge_str];

        if (edgeOnPath(ai,bi) ) {
            if ( lineNeedsSplitting(path, ai, bi) || !oldPath[edge_str] ) {
                scene.remove(prevEdgeGroup);
                // Splitting cases
                if (path.length === 2) {
                    if (bi === 1) {
                        edgeGroup = tripleSplit(ap, bp, sf, ef, faded, hilight, spaceFn, pathSpaceFn);
                    } else {
                        edgeGroup = tripleSplit(bp, ap, sf, ef, faded, hilight, spaceFn, pathSpaceFn);
                    }
                } else if (ai === 0) {
                    edgeGroup = splitLine(ap, bp, sf, faded, hilight, spaceFn, pathSpaceFn, srcSphere);
                } else if (ai === path.length - 1) {
                    edgeGroup = splitLine(ap, bp, ef, faded, hilight, spaceFn, pathSpaceFn, dstSphere);
                } else if (bi === 0) {
                    edgeGroup = splitLine(bp, ap, sf, faded, hilight, spaceFn, pathSpaceFn, srcSphere);
                } else if (bi === path.length - 1) {
                    edgeGroup = splitLine(bp, ap, ef, faded, hilight, spaceFn, pathSpaceFn, dstSphere);
                } else if (!oldPath[edge_str]) { // Non-splitting case
                    edgeGroup.add(makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, pathSpaceFn));
                    edgeGroup.add(makeLine(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hilight));
                }
                oldEdges[edge_str] = edgeGroup;
                scene.add(edgeGroup);
            }
            oldPath[edge_str] = true; // definitely on path now
        } else {
            if (oldPath[edge_str]) { // destroy and re-add iff was on path and now is not
                scene.remove(prevEdgeGroup);
                edgeGroup = makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, spaceFn);
                scene.add(edgeGroup);
            }
            oldPath[edge_str] = false; // definitely off path now
        }
    }
    // turn start into lerped start (using sf <- startFrac)
    // turn end into lerped end (using ef)
    var start = convertVec(coords[path[0]]);
    var next = convertVec(coords[path[1]]);
    start = (new THREE.Vector3()).lerpVectors(start, next, sf);
    followPath(start, next, 3000);
}

var tween;
function followPath(startVec, endVec, time) {
    var dir = (new THREE.Vector3()).subVectors(endVec, startVec).normalize();
    camera.position.copy(startVec);
    controls.target = (new THREE.Vector3()).addVectors(endVec, dir); // look a little bit past the next vertex
    tween = new TWEEN.Tween(startVec).to(endVec, time);
    tween.onUpdate(function(){
        // console.log(startVec);
        camera.position.copy(startVec);
    });
    tween.start();
}

// Animate function
// Note: I structured it as a factory so that
// it can be called inside init() so we can avoid
// too many global variables
function animateFactory(renderer, controls, stats, camera) {
    var animate = function () {
        stats.begin();
        controls.update();
        renderer.render(scene, camera);
        TWEEN.update();
        stats.end();
        requestAnimationFrame(animate);
    };
    return animate;
}

// --------- Code Executed on Page Load ---------
// The SCENE needs to be global since external functions modify it.
// The CAMERA and CONTROLS need to be global since we need to follow the path in GENSCENE().
// Everything else can live inside init() to avoid cluttering the global namespace.
var scene = null;
var camera = null;
var controls = null;
var renderer = null;
function init() {
    var container = document.getElementById('vis');
    var width = container.clientWidth;
    var height = container.clientHeight;
    // Instantiate CAMERA object
    camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 5000);
    camera.position.set(-300, 180, 180);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    // Instantiate RENDERER object
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    // STATS (fps, memory, etc.)
    var stats = new Stats();
    stats.showPanel( 0 );
    document.body.appendChild( stats.dom );
    // ORBIT CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    // Generate the Geometry of Dwinelle
    scene = new THREE.Scene();
    initScene();
    scene.add(makeArrowHelper(0, 0, 0, 0, 0, 1, 2, 0x325EFF));
    scene.add(makeArrowHelper(0, 0, 0, 0, 1, 0, 2, 0x7F4B05));
    scene.add(makeArrowHelper(0, 0, 0, 1, 0, 0, 2, 0x000000));
    // Adjust Size on Window Resize
    var onWindowResize = function() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onWindowResize, false);
    // Start the Animation Loop
    var animate = animateFactory(renderer, controls, stats, camera);
    animate();
}

init();

// @license-end
