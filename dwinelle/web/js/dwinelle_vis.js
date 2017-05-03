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

var oldPath = {};
var oldEdges = {};
function initScene() {
    scene.add(makeEnvSphere('./js/dwinelle_env.jpg'));
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

var currentPath = [];
var currentSf = 1;
var currentEf = 1;
function updateScenePath(path, sf, ef) {
    currentPath = path;
    currentSf = sf;
    currentEf = ef;
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
            } else { // Non-splitting case
                edgeGroup.add(makeSpace(ap.x, ap.y, ap.z, bp.x, bp.y, bp.z, pathSpaceFn));
                edgeGroup.add(makePath(ap, bp, hilight));
            }
            oldEdges[edge_str] = edgeGroup;
            scene.add(edgeGroup);
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
}

// Animate function
// Note: I structured it as a factory so that
// it can be called inside init() so we can avoid
// too many global variables
function animateFactory(renderer, controls, stats, camera) {
    var animate = function () {
        // stats.begin();
        controls.update();
        renderer.render(scene, camera);
        TWEEN.update();
        // stats.end();
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
function init() {
    var container = document.getElementById('vis');
    var width = container.clientWidth;
    var height = container.clientHeight;
    // Instantiate CAMERA object
    camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 5000);
    camera.position.set(-168, 25, -17);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    // Instantiate RENDERER object
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    // STATS (fps, memory, etc.)
    // var stats = new Stats();
    // stats.showPanel( 0 );
    // document.body.appendChild( stats.dom );
    // ORBIT CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    // Generate the Geometry of Dwinelle
    scene = new THREE.Scene();
    var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1000, 20, 20),
    new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('http://localhost:5000/pages/cs184-final/final-page/photosphere-gh-pages/unnamed.jpg')
    })
    );
    sphere.scale.x = -1;
    scene.add(sphere);
    initScene();
    // scene.add(makeArrowHelper(0, 0, 0, 0, 0, 1, 2, 0x325EFF));
    // scene.add(makeArrowHelper(0, 0, 0, 0, 1, 0, 2, 0x7F4B05));
    // scene.add(makeArrowHelper(0, 0, 0, 1, 0, 0, 2, 0x000000));
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
    var animate = animateFactory(renderer, controls, undefined, camera);
    animate();
}

init();

// @license-end
