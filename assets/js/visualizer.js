var submitted = false;

function inputNextGesture() {
    if (queryString != null && getParameterByName("gesture", false).length > 0) {
        return location.origin + location.pathname + "?" + queryString;
    } else {
        return '../';
    }
}

function getParameterByName(name, remove) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(queryString);

    if (remove && results != null)
        queryString = queryString.substring(queryString.indexOf(results[0]) + results[0].length);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var queryString = location.search;

$(document).ready(function() {
    var gesture = getParameterByName("gesture", true);

    document.getElementById("gesture").value = gesture;
    document.getElementById("gesture-image").innerHTML = (gesture.length == 0) ?
        "No gesture selected!" : "<img src=../assets/img/"+ gesture + "_snapshot.png>";

    var control = getParameterByName("control", false);
    document.getElementById("Control").value = control;
});

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
    var handId;

    if (handId == null || frame.hand(handId) == null)
        handId = getBestHand(frame);

    var hand = frame.hand(handId);
    recordHandInfo(hand);
      
    if (hand != undefined && hand.valid) {
        recordHandInfo(hand);
        recordFingersInfo(hand.fingers);
        var palmCenter = hand.palmPosition;

        var origin = new THREE.Vector3(palmCenter[0], palmCenter[1], palmCenter[2]);
        var orientation = new THREE.Vector3(hand.pitch()-Math.PI/2, -hand.roll(), -hand.yaw()+Math.PI/2);

        var radius   = 60,
            segments = 64,
            material = new THREE.LineBasicMaterial( { color: 0x0000aa , linewidth: 5} ),
            geometry = new THREE.CircleGeometry( radius, segments );

        scene.remove(circle);
        circle = new THREE.Line( geometry, material );
        circle.position = origin;
        circle.rotation = orientation;

        scene.add(circle);

        for (var index = 0; index < hand.pointables.length; index++) {

            var pointable = hand.pointables[index];
            var finger = fingers[pointable.id];

            var pos = pointable.tipPosition;
            var dir = pointable.direction;

            var origin = new THREE.Vector3(pos[0], pos[1], pos[2]);
            var direction = new THREE.Vector3(dir[0], dir[1], dir[2]);

            if (!finger) {
                finger = new THREE.ArrowHelper(origin, direction, 40);

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
            } else {
                var v = hand.finger(fingerId).tipVelocity;
                var s = v[0] + v[1] + v[2];
                fingers[fingerId].setColor(s > 21 ? 0xff0000 : 0x00ff00);
            }
        }
    } else {
        scene.remove(circle);
    }

    renderer.render(scene, camera);
  });
};

function getBestHand(f) {
    if (f == undefined) return undefined;
    var h, m = 0;

    for (var i = 0; i < f.hands.length; i++) {
        if (f.hands[i].timeVisable > m) {
            h = f.hands[i].id;
            m = f.hands[i].timeVisable;
        } else if (f.hands[i].timeVisable == m || h == undefined) {
            if (h == undefined) h = f.hands[i].id;
            if (f.hands[i].fingers.length > f.hand(h).fingers.length) {
                h = f.hands[i].id;
            }
        }
    }

    return h;
}

function recordHandInfo(h) {
    var has_data = (h != undefined && h.valid);

    document.getElementById('hn.pos.x').value      = (has_data) ? h.palmPosition[0] : '';
    document.getElementById('hn.pos.y').value      = (has_data) ? h.palmPosition[1] : '';
    document.getElementById('hn.pos.z').value      = (has_data) ? h.palmPosition[2] : '';

    document.getElementById('hn.pitch').value      = (has_data) ? h.pitch() : '';
    document.getElementById('hn.yaw').value        = (has_data) ? h.yaw() : '';
    document.getElementById('hn.roll').value       = (has_data) ? h.roll() : '';

    document.getElementById('hn.sphere.x').value   = (has_data) ? h.sphereCenter[0] : '';
    document.getElementById('hn.sphere.y').value   = (has_data) ? h.sphereCenter[1] : '';
    document.getElementById('hn.sphere.z').value   = (has_data) ? h.sphereCenter[2] : '';
    document.getElementById('hn.sphere.r').value   = (has_data) ? h.sphereRadius : '';
}

function recordFingersInfo(fs) {
    for (var i = 0; i < fs.length; i++) {
        document.getElementById('fg' + i + '.direction.x').value = fs[i].direction[0];
        document.getElementById('fg' + i + '.direction.y').value = fs[i].direction[1];
        document.getElementById('fg' + i + '.direction.z').value = fs[i].direction[2];

        document.getElementById('fg' + i + '.tip.x').value       = fs[i].tipPosition[0];
        document.getElementById('fg' + i + '.tip.y').value       = fs[i].tipPosition[1];
        document.getElementById('fg' + i + '.tip.z').value       = fs[i].tipPosition[2];
    }
    for (var i = fs.length; i < 5; i++) {
        document.getElementById('fg' + i + '.direction.x').value = '';
        document.getElementById('fg' + i + '.direction.y').value = '';
        document.getElementById('fg' + i + '.direction.z').value = '';

        document.getElementById('fg' + i + '.tip.x').value       = '';
        document.getElementById('fg' + i + '.tip.y').value       = '';
        document.getElementById('fg' + i + '.tip.z').value       = '';
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
    document.getElementById('canvas-container').innerHTML = (renderer == undefined) ?
        'If you are not already doing it, please use the Google Chrome browser' : '';
    document.getElementById("canvas-container").appendChild(renderer.domElement);
});
controller.on('blur', function() {
    document.getElementById('canvas-container').innerHTML = 'Page is not in focus.';
    console.log("blur");
});
controller.on('deviceConnected', function() {
    document.getElementById('canvas-container').innerHTML = (renderer == undefined) ?
        'If you are not already doing it, please use the Google Chrome browser': '';
    document.getElementById("canvas-container").appendChild(renderer.domElement);
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    document.getElementById('canvas-container').innerHTML = 'The Leap Controller was disconnected.';
    console.log("deviceDisconnected");
});
controller.connect();
