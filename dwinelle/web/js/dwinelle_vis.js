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

function convertVec(x, y, z) {
    // The data was recorded with z representing UP
    // 3d rendering uses y as the up direction by convention
    var SHRINK = 610;
    var X_OFFSET = 0;
    var Y_OFFSET = -200;
    var Z_SHRINK = 1000;
    var Z_OFFSET = -35;
    return new THREE.Vector3(x / SHRINK + X_OFFSET,
        z / Z_SHRINK + Z_OFFSET,
        -(y / SHRINK + Y_OFFSET));
}

function makeSpace(ax, ay, az, bx, by, bz, spaceFn) {
    var a = convertVec(ax, ay, az);
    var b = convertVec(bx, by, bz);
    return makeSpaceAsVector(a.x, a.y, a.z, b.x, b.y, b.z, spaceFn);
}

function makeLine(ax, ay, az, bx, by, bz, m) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(convertVec(ax, ay, az));
    geometry.vertices.push(convertVec(bx, by, bz));

    return new THREE.Line(geometry, m);
}

function splitLine(ap, bp, fraction, m1, m2, space1, space2) {
    var meshes = new THREE.Group();
    var mx = ap.x + fraction * (bp.x - ap.x);
    var my = ap.y + fraction * (bp.y - ap.y);
    var mz = ap.z + fraction * (bp.z - ap.z);

    meshes.add(makeLine(ap.x, ap.y, ap.z, mx, my, mz, m1));
    meshes.add(makeSpace(ap.x, ap.y, ap.z, mx, my, mz, space1));

    meshes.add(makeLine(mx, my, mz, bp.x, bp.y, bp.z, m2));
    meshes.add(makeSpace(mx, my, mz, bp.x, bp.y, bp.z, space2));
    return meshes;
}

// needed when the source and destination are on the same edge
function tripleSplit(ap, bp, f1, f2, m1, m2, space1, space2) {
    var meshes = new THREE.Group();
    if (f1 > f2) {
        var t = f1;
        f1 = f2;
        f2 = t;
    }
    var m1x = ap.x + f1 * (bp.x - ap.x);
    var m1y = ap.y + f1 * (bp.y - ap.y);
    var m1z = ap.z + f1 * (bp.z - ap.z);

    var m2x = ap.x + f2 * (bp.x - ap.x);
    var m2y = ap.y + f2 * (bp.y - ap.y);
    var m2z = ap.z + f2 * (bp.z - ap.z);

    meshes.add(makeLine(ap.x, ap.y, ap.z, m1x, m1y, m1z, m1));
    meshes.add(makeSpace(ap.x, ap.y, ap.z, m1x, m1y, m1z, space1));

    meshes.add(makeLine(m1x, m1y, m1z, m2x, m2y, m2z, m2));
    meshes.add(makeSpace(m1x, m1y, m1z, m2x, m2y, m2z, space2));

    meshes.add(makeLine(m2x, m2y, m2z, bp.x, bp.y, bp.z, m1));
    meshes.add(makeSpace(m2x, m2y, m2z, bp.x, bp.y, bp.z, space1));
    return meshes;
}

function endSphere(ap, bp, fraction, m) {
    var mx = ap.x + fraction * (bp.x - ap.x);
    var my = ap.y + fraction * (bp.y - ap.y);
    var mz = ap.z + fraction * (bp.z - ap.z);

    var geometry = new THREE.SphereGeometry(1);
    var sphere = new THREE.Mesh(geometry, m);
    sphere.position.copy(convertVec(mx, my, mz));
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

function genScene(path, startFrac, endFrac) {
    // Returns a scene containing the full path
    for (var edge_str in el) {
        var s = edge_str.split(' ');
        var a = parseInt(s[0], 10);
        var b = parseInt(s[1], 10);

        var ap = coords[a];
        var bp = coords[b];

        var ai = path.indexOf(a);
        var bi = path.indexOf(b);

        var edgeGroup = new THREE.Group();
        edgeGroup.name = edge_str;
        var prevEdgeGroup = oldEdges[edge_str];
        if (edgeOnPath(ai,bi) ) {
            // Splitting Cases
            // destroy and re-add every time
            if ( lineNeedsSplitting(path, ai, bi) || !oldPath[edge_str] ) {
                scene.remove(prevEdgeGroup);
                // Splitting cases
                if (path.length === 2) {
                    var sf = (bi === 0) ? 1 - startFrac : startFrac;
                    var ef = (bi === 1) ? 1 - endFrac : endFrac;
                    edgeGroup = tripleSplit(ap, bp, sf, ef, faded, hilight, hallwayType1_simple, hallwayType1_realistic);
                    edgeGroup.add(endSphere(ap, bp, sf, srcSphere));
                    edgeGroup.add(endSphere(ap, bp, ef, dstSphere));
                } else if (ai === 0) {
                    edgeGroup.add(splitLine(ap, bp, startFrac, faded, hilight, hallwayType1_simple, hallwayType1_realistic));
                    edgeGroup.add(endSphere(ap, bp, startFrac, srcSphere));
                } else if (ai === path.length - 1) {
                    edgeGroup.add(splitLine(ap, bp, endFrac, faded, hilight, hallwayType1_simple, hallwayType1_realistic));
                    edgeGroup.add(endSphere(ap, bp, endFrac, dstSphere));
                } else if (bi === 0) {
                    edgeGroup.add(splitLine(ap, bp, 1 - startFrac, hilight, faded, hallwayType1_realistic, hallwayType1_simple));
                    edgeGroup.add(endSphere(ap, bp, 1 - startFrac, srcSphere));
                } else if (bi === path.length - 1) {
                    edgeGroup.add(splitLine(ap, bp, 1 - endFrac, hilight, faded, hallwayType1_realistic, hallwayType1_simple));
                    edgeGroup.add(endSphere(ap, bp, 1 - endFrac, dstSphere));
                } else if (!oldPath[edge_str]) { // Non-splitting case
                    edgeGroup.add(makeLine(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hilight));
                    edgeGroup.add(makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hallwayType1_realistic));
                }
                oldEdges[edge_str] = edgeGroup;
                scene.add(edgeGroup);
            }
            oldPath[edge_str] = true; // definitely on path now
        } else {
            if (oldPath[edge_str]) { // destroy and re-add iff was on path and now is not
                scene.remove(prevEdgeGroup);
                edgeGroup.add(makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hallwayType1_simple));
                scene.add(edgeGroup);
            }
            oldPath[edge_str] = false; // definitely off path now
        }
    }
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
        stats.end();
        requestAnimationFrame(animate);
    };
    return animate;
}

// --------- Code Executed on Page Load ---------
// The SCENE needs to be global since external functions modify it.
// Everything else can live inside init() to avoid cluttering the global namespace.
var scene = new THREE.Scene();
function init() {
    var container = document.getElementById('vis');
    var width = container.clientWidth;
    var height = container.clientHeight;
    // Instantiate CAMERA object
    var camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 5000);
    camera.position.set(-300, 180, 180);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    // Instantiate RENDERER object
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    // STATS (fps, memory, etc.)
    var stats = new Stats();
    stats.showPanel( 0 );
    document.body.appendChild( stats.dom );
    // ORBIT CONTROLS
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = false;
    // Generate the Geometry of Dwinelle
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
