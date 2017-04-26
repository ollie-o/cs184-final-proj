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
    var SHRINK = 305;
    var X_OFFSET = 0;
    var Y_OFFSET = -200;
    var Z_SCALE = 0.002;
    var Z_OFFSET = -35;
    // return new THREE.Vector3(x,y,z);
    return new THREE.Vector3(x / SHRINK + X_OFFSET,
        z * Z_SCALE + Z_OFFSET,
        -(y / SHRINK + Y_OFFSET));
}

function makeLine(ax, ay, az, bx, by, bz, m) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(convertVec(ax, ay, az));
    geometry.vertices.push(convertVec(bx, by, bz));

    return new THREE.Line(geometry, m);
}

function splitLine(scene, ap, bp, fraction, m1, m2) {
    var mx = ap.x + fraction * (bp.x - ap.x);
    var my = ap.y + fraction * (bp.y - ap.y);
    var mz = ap.z + fraction * (bp.z - ap.z);

    scene.add(makeLine(ap.x, ap.y, ap.z, mx, my, mz, m1));
    scene.add(makeLine(mx, my, mz, bp.x, bp.y, bp.z, m2));
}

// needed when the source and destination are on the same edge
function tripleSplit(scene, ap, bp, f1, f2, m1, m2) {
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

    scene.add(makeLine(ap.x, ap.y, ap.z, m1x, m1y, m1z, m1));
    scene.add(makeLine(m1x, m1y, m1z, m2x, m2y, m2z, m2));
    scene.add(makeLine(m2x, m2y, m2z, bp.x, bp.y, bp.z, m1));
}

function endSphere(ap, bp, fraction, m) {
    var mx = ap.x + fraction * (bp.x - ap.x);
    var my = ap.y + fraction * (bp.y - ap.y);
    var mz = ap.z + fraction * (bp.z - ap.z);

    var geometry = new THREE.SphereGeometry(2.5);
    var sphere = new THREE.Mesh(geometry, m);
    //sphere.position.set(mx / SHRINK + X_OFFSET, mz * Z_SCALE + Z_OFFSET, -(my / SHRINK + Y_OFFSET));
    sphere.position.copy(convertVec(mx, my, mz));
    return sphere;
}

function genScene(path, startFrac, endFrac) {
    // Returns a scene containing the full path
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    console.log(path);

    for (var edge_str in el) {
        var s = edge_str.split(' ');
        var a = parseInt(s[0], 10);
        var b = parseInt(s[1], 10);

        var ap = coords[a];
        var bp = coords[b];

        var ai = path.indexOf(a);
        var bi = path.indexOf(b);

        if (ai >= 0 && bi >= 0 && Math.abs(ai - bi) === 1) {
            if (path.length === 2) {
                console.log("it's 2");
                var sf = (bi === 0) ? 1 - startFrac : startFrac;
                var ef = (bi === 1) ? 1 - endFrac : endFrac;
                tripleSplit(scene, ap, bp, sf, ef, faded, hilight);
                scene.add(endSphere(ap, bp, sf, srcSphere));
                scene.add(endSphere(ap, bp, ef, dstSphere));
            } else if (ai === 0) {
                splitLine(scene, ap, bp, startFrac, faded, hilight);
                scene.add(endSphere(ap, bp, startFrac, srcSphere));
            } else if (ai === path.length - 1) {
                splitLine(scene, ap, bp, endFrac, faded, hilight);
                scene.add(endSphere(ap, bp, endFrac, dstSphere));
            } else if (bi === 0) {
                splitLine(scene, ap, bp, 1 - startFrac, hilight, faded);
                scene.add(endSphere(ap, bp, 1 - startFrac, srcSphere));
            } else if (bi === path.length - 1) {
                splitLine(scene, ap, bp, 1 - endFrac, hilight, faded);
                scene.add(endSphere(ap, bp, 1 - endFrac, dstSphere));
            } else {
                scene.add(makeLine(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, hilight));
            }
        } else {
            var m = null;
            if (path.length === 0) {
                m = material;
            } else {
                m = faded;
            }
            var line = makeLine(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, m);
            scene.add(line);
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
var scene = null;
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
    controls.autoRotate = true;
    // Generate the Geometry of Dwinelle
    genScene([], 0, 0);
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
