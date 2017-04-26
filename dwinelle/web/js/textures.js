var material = new THREE.LineBasicMaterial({ color: 0x000000 });
var hilight = new THREE.LineBasicMaterial({ color: 0x0087C6, linewidth: 2 });
var faded = new THREE.LineBasicMaterial({ color: 0xbfbfbf });
var srcSphere = new THREE.MeshBasicMaterial({ color: 0x157e2d });
var dstSphere = new THREE.MeshBasicMaterial({ color: 0x7e1515 });

var paintMat = new THREE.MeshLambertMaterial( {color: 0xA8A280, side: THREE.BackSide} );
var floorMat = new THREE.MeshPhongMaterial( {color: 0x42331F, side: THREE.BackSide} );
floorMat.shininess = 110;