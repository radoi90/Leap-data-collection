var scene, camera, renderer;

var init = function(){
  scene = new THREE.Scene();
  var width = document.getElementById("canvas-container").offsetWidth;
  window.addEventListener('resize', resizeCanvas, false);
  camera = new THREE.PerspectiveCamera(45, width/400, 0.10, 1000);
  renderer = new THREE.WebGLRenderer();
  resizeCanvas();

  camera.position.z = 10;
  camera.position.y = 600;

  camera.lookAt(new THREE.Vector3(0,100,-50));

  var fingers = {};
  var circle;

  Leap.loop(function(frame) {

    var fingerIds = {};
    var handIds = {};

    for (var index =0; index < frame.hands.length; index++) {
      var hand = frame.hands[index];
      recordHandInfo(hand);
      recordFingersInfo(hand.fingers);
      var palmCenter = hand.palmPosition;

      var origin = new THREE.Vector3(palmCenter[0], palmCenter[1], palmCenter[2]);
      var orientation = new THREE.Vector3(hand.pitch()-Math.PI/2, -hand.roll(), -hand.yaw()+Math.PI/2);

      var radius   = 60,
          segments = 64,
          material = new THREE.LineBasicMaterial( { color: 0x0000ff } ),
          geometry = new THREE.CircleGeometry( radius, segments );

      scene.remove(circle);
      circle = new THREE.Line( geometry, material );
      circle.position = origin;
      circle.rotation = orientation;

      scene.add(circle);
    }

    for (var index = 0; index < frame.pointables.length; index++) {

      var pointable = frame.pointables[index];
      var finger = fingers[pointable.id];

      var pos = pointable.tipPosition;
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

    renderer.render(scene, camera);
  });
};

function recordHandInfo(h) {
    document.getElementById('Hand.position.x').value = h.palmPosition[0];
    document.getElementById('Hand.position.y').value = h.palmPosition[1];
    document.getElementById('Hand.position.z').value = h.palmPosition[2];

    document.getElementById('Hand.pitch').value      = h.pitch();
    document.getElementById('Hand.yaw').value        = h.yaw();
    document.getElementById('Hand.roll').value       = h.roll();

    document.getElementById('Hand.sphere.x').value   = h.sphereCenter[0];
    document.getElementById('Hand.sphere.y').value   = h.sphereCenter[1];
    document.getElementById('Hand.sphere.z').value   = h.sphereCenter[2];
    document.getElementById('Hand.sphere.r').value   = h.sphereRadius;
}

function recordFingersInfo(fs) {
    for (var i = 0; i < fs.length; i++) {
        document.getElementById('finger' + i + '.direction.x').value = fs[i].direction[0];
        document.getElementById('finger' + i + '.direction.y').value = fs[i].direction[1];
        document.getElementById('finger' + i + '.direction.z').value = fs[i].direction[2];

        document.getElementById('finger' + i + '.tip.x').value       = fs[i].tipPosition[0];
        document.getElementById('finger' + i + '.tip.y').value       = fs[i].tipPosition[1];
        document.getElementById('finger' + i + '.tip.z').value       = fs[i].tipPosition[2];
    }
}

function resizeCanvas() {
    var width = document.getElementById("canvas-container").offsetWidth;
    camera.aspect = width/400;
    camera.updateProjectionMatrix();
    renderer.setSize(width, 400);

    renderer.render(scene,camera);
}

var controller = new Leap.Controller();

controller.on('ready', function() {
    document.getElementById('canvas-container').innerHTML = 'It works!';
    console.log("It works");
});
controller.on('connect', function() {
    document.getElementById('canvas-container').innerHTML = 'Waiting to connect...';
    init();
    console.log("connect");
});
controller.on('disconnect', function() {
    document.getElementById('canvas-container').innerHTML = 'Leap was disconnected...';
    console.log("disconnect");
});
controller.on('focus', function() {
    document.getElementById('canvas-container').innerHTML = '';
    document.getElementById("canvas-container").appendChild(renderer.domElement);
});
controller.on('blur', function() {
    document.getElementById('canvas-container').innerHTML = 'Leapstrap is not in focus.';
    console.log("blur");
});
controller.on('deviceConnected', function() {
    document.getElementById('canvas-container').innerHTML = '';
    document.getElementById("canvas-container").appendChild(renderer.domElement);
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    document.getElementById('canvas-container').innerHTML = 'The Leap Controller was disconnected.';
    console.log("deviceDisconnected");
});
controller.connect();
