var data = {};

function readData() {
    d3.csv("../assets/data/all_gestures_sorted.csv", function(d) {
        data[d.Timestamp] = d;
    }, function(error, rows) {
        loadData(data);
        normalize(data);
    });
}

readData();

function normalize(d) {
    for (var e in d) {
        for(var p in d[e]) {
            if (d[e][p] == '') delete d[e][p];
        }

        var hX = +d[e].Hand_position_x;
        var hY = +d[e].Hand_position_y;
        var hZ = +d[e].Hand_position_z;

        d[e].Hand_position_x = +d[e].Hand_position_x - hX;
        d[e].Hand_position_y = +d[e].Hand_position_y - hY;
        d[e].Hand_position_z = +d[e].Hand_position_z - hZ;

        for (var i = 0; d[e]["finger"+i+"_tip_x"] != undefined; i++) {
            d[e]["finger"+i+"_tip_x"] = +d[e]["finger"+i+"_tip_x"] - hX;
            d[e]["finger"+i+"_tip_y"] = +d[e]["finger"+i+"_tip_y"] - hY;
            d[e]["finger"+i+"_tip_z"] = +d[e]["finger"+i+"_tip_z"] - hZ;
        }
    }
}

function loadData(d) {
    var select = document.getElementById("gesture");

    for (var e in d) {
        var el = document.createElement("option");
        el.textContent = d[e].Timestamp + " " + d[e].Gesture;
        el.value = e;
        select.appendChild(el);
    }

    $( "#gesture" ).change(function() {
        gesture = (d[this.value] != undefined) ? d[this.value].Gesture : '';
        document.getElementById("gesture-image").innerHTML = (gesture.length == 0) ?
            "No gesture selected!" : "<img src=../assets/img/gesture" + gesture + "_snapshot.png>";
        if (d[this.value] != undefined) {
            draw(d[this.value]);
            document.getElementById('canvas-container').innerHTML = (renderer == undefined) ?
                'If you are not already doing it, please use the Google Chrome browser' : '';
            document.getElementById("canvas-container").appendChild(renderer.domElement);
            displayHandInfo(d[this.value]);
            displayFingersInfo(d[this.value]);
        }
    });
}

function displayHandInfo(d) {
    document.getElementById('hn.pos.x').value      = +d.Hand_position_x;
    document.getElementById('hn.pos.y').value      = +d.Hand_position_y;
    document.getElementById('hn.pos.z').value      = +d.Hand_position_z;

    document.getElementById('hn.pitch').value      = +d.Hand_pitch;
    document.getElementById('hn.yaw').value        = +d.Hand_yaw;
    document.getElementById('hn.roll').value       = +d.Hand_roll;

    document.getElementById('hn.sphere.x').value   = +d.Hand_sphere_x;
    document.getElementById('hn.sphere.y').value   = +d.Hand_sphere_y;
    document.getElementById('hn.sphere.z').value   = +d.Hand_sphere_z;
    document.getElementById('hn.sphere.r').value   = +d.Hand_sphere_r;
}

function displayFingersInfo(d) {
    for (var i = 0; i < 5; i++) {
        document.getElementById('fg' + i + '.direction.x').value = +d["finger"+i+"_direction_x"];
        document.getElementById('fg' + i + '.direction.y').value = +d["finger"+i+"_direction_y"];
        document.getElementById('fg' + i + '.direction.z').value = +d["finger"+i+"_direction_z"];

        document.getElementById('fg' + i + '.tip.x').value       = +d["finger"+i+"_tip_x"];
        document.getElementById('fg' + i + '.tip.y').value       = +d["finger"+i+"_tip_y"];
        document.getElementById('fg' + i + '.tip.z').value       = +d["finger"+i+"_tip_z"];
    }
}

var scene, camera, renderer;

var draw = function(d){
    scene = new THREE.Scene();
    var width = document.getElementById("canvas-container").offsetWidth;
    window.addEventListener('resize', resizeCanvas, false);
    camera = new THREE.PerspectiveCamera(45, width/400, 0.10, 1000);
    renderer = new THREE.WebGLRenderer();
    resizeCanvas();

    camera.position.z = 10;
    camera.position.y = 600;

    camera.lookAt(new THREE.Vector3(0,100,-50));

    var circle;
    var origin = new THREE.Vector3(+d.Hand_position_x, +d.Hand_position_y, +d.Hand_position_z);
    var orientation = new THREE.Vector3(+d.Hand_pitch-Math.PI/2, -(+d.Hand_roll), -(+d.Hand_yaw)+Math.PI/2);

    var radius   = 60,
        segments = 64,
        material = new THREE.LineBasicMaterial( { color: 0x0000aa , linewidth: 5} ),
        geometry = new THREE.CircleGeometry( radius, segments );

    circle = new THREE.Line( geometry, material );
    circle.position = origin;
    circle.rotation = orientation;
    scene.add(circle);

    for (var i = 0; d["finger"+i+"_tip_x"] != undefined; i++) {
        var origin = new THREE.Vector3(+d["finger"+i+"_tip_x"], +d["finger"+i+"_tip_y"], +d["finger"+i+"_tip_z"]);
        var direction = new THREE.Vector3(+d["finger"+i+"_direction_x"], +d["finger"+i+"_direction_y"], +d["finger"+i+"_direction_z"]);

        var finger = new THREE.ArrowHelper(origin, direction, 40);
        finger.setColor(0xff0000);

        finger.position = origin;
        finger.setDirection(direction);

        scene.add(finger);
    }

    renderer.render(scene, camera);
};

function resizeCanvas() {
    var width = document.getElementById("canvas-container").offsetWidth;
    camera.aspect = width/400;
    camera.updateProjectionMatrix();
    renderer.setSize(width, 400);

    renderer.render(scene,camera);
}