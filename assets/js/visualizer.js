  var init = function(){
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.10, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.z = 100;
  camera.position.y = 500;
  camera.lookAt(new THREE.Vector3(0,200,0));

  var fingers = {};
  var spheres = {};

  Leap.loop(function(frame) {

    var fingerIds = {};
    var handIds = {};

    for (var index = 0; index < frame.pointables.length; index++) {

      var pointable = frame.pointables[index];
      var finger = fingers[pointable.id];

      var pos = pointable.stabilizedTipPosition;
      var dir = pointable.direction;

      var origin = new THREE.Vector3(pos[0], pos[1], pos[2]);
      var direction = new THREE.Vector3(dir[0], dir[1], dir[2]);

      if (!finger) {
        finger = new THREE.ArrowHelper(origin, direction, 40, Math.random() * 0xffffff);
        fingers[pointable.id] = finger;
        scene.add(finger);
      }

      finger.position = origin;
      finger.setDirection(direction);

      fingerIds[pointable.id] = true;
    }

    for (fingerId in fingers) {
      if (!fingerIds[fingerId]) {
        scene.remove(fingers[fingerId]);
        delete fingers[fingerId];
      }
    }

    //if(frame.gestures.length > 0) console.log(frame.gestures);

    renderer.render(scene, camera);
  });
};
setTimeout(init, 100);