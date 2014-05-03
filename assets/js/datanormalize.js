var data = {};

function readData() {
    d3.csv("../assets/data/all_gestures_sorted.csv", function(d) {
        data[d.Timestamp] = d;
    }, function(error, rows) {
        normalize(data);
        loadData(data);
    });
};

readData();

function normalize(d) {
    for (var e in d) {
        var num_fingers = 0;
        for(var i = 0; i < 5; i++) {
            if (d[e]["finger"+i+"_tip_x"] == '') {
                delete d[e]["finger"+i+"_tip_x"];
                delete d[e]["finger"+i+"_tip_y"];
                delete d[e]["finger"+i+"_tip_z"];
                delete d[e]["finger"+i+"_direction_x"];
                delete d[e]["finger"+i+"_direction_y"];
                delete d[e]["finger"+i+"_direction_z"];
            }
            else num_fingers++;
        }
        d[e]["num_fingers"] = num_fingers;

        var hX = +d[e].Hand_position_x;
        var hY = +d[e].Hand_position_y;
        var hZ = +d[e].Hand_position_z;

        d[e]["hand_position"] = new THREE.Vector3(0, 0, 0);
        delete d[e].Hand_position_x;
        delete d[e].Hand_position_y;
        delete d[e].Hand_position_z;

        d[e]["Hand_pitch"]  = +d[e]["Hand_pitch"];
        d[e]["Hand_yaw"]    = +d[e]["Hand_yaw"];
        d[e]["Hand_roll"]   = +d[e]["Hand_roll"];

        var X = new THREE.Vector3(1,0,0);
        var Y = new THREE.Vector3(0,1,0);
        var Z = new THREE.Vector3(0,0,1);

        d[e]["sphere_position"] = new THREE.Vector3((+d[e].Hand_sphere_x) - hX, (+d[e].Hand_sphere_y) - hY, (+d[e].Hand_sphere_z) - hZ);

        d[e]["sphere_position"].applyAxisAngle(X, -d[e].Hand_pitch);
        d[e]["sphere_position"].applyAxisAngle(Y, d[e].Hand_yaw);
        d[e]["sphere_position"].applyAxisAngle(Z, -d[e].Hand_roll);

        delete d[e].Hand_sphere_x;
        delete d[e].Hand_sphere_y;
        delete d[e].Hand_sphere_z;

        for (var i = 0; i < d[e].num_fingers; i++) {
            d[e]["finger"+i+"_position"] = new THREE.Vector3();
            d[e]["finger"+i+"_position"].setX(+d[e]["finger"+i+"_tip_x"] - hX);
            d[e]["finger"+i+"_position"].setY(+d[e]["finger"+i+"_tip_y"] - hY);
            d[e]["finger"+i+"_position"].setZ(+d[e]["finger"+i+"_tip_z"] - hZ);

            d[e]["finger"+i+"_position"].applyAxisAngle(X, -d[e].Hand_pitch);
            d[e]["finger"+i+"_position"].applyAxisAngle(Y, d[e].Hand_yaw);
            d[e]["finger"+i+"_position"].applyAxisAngle(Z, -d[e].Hand_roll);

            delete d[e]["finger"+i+"_tip_x"];
            delete d[e]["finger"+i+"_tip_y"];
            delete d[e]["finger"+i+"_tip_z"];
            
            d[e]["finger"+i+"_direction"] = new THREE.Vector3();
            d[e]["finger"+i+"_direction"].setX(+d[e]["finger"+i+"_direction_x"]);
            d[e]["finger"+i+"_direction"].setY(+d[e]["finger"+i+"_direction_y"]);
            d[e]["finger"+i+"_direction"].setZ(+d[e]["finger"+i+"_direction_z"]);

            d[e]["finger"+i+"_direction"].applyAxisAngle(X, -d[e].Hand_pitch);
            d[e]["finger"+i+"_direction"].applyAxisAngle(Y, d[e].Hand_yaw);
            d[e]["finger"+i+"_direction"].applyAxisAngle(Z, -d[e].Hand_roll);

            delete d[e]["finger"+i+"_direction_x"];
            delete d[e]["finger"+i+"_direction_y"];
            delete d[e]["finger"+i+"_direction_z"];
        }

        d[e]["Hand_pitch"]  = 0;
        d[e]["Hand_yaw"]    = 0;
        d[e]["Hand_roll"]   = 0;
    }
};

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
        };
    });
};

function displayHandInfo(d) {
    document.getElementById('hn.pos.x').value      = d.hand_position.x;
    document.getElementById('hn.pos.y').value      = d.hand_position.y;
    document.getElementById('hn.pos.z').value      = d.hand_position.z;

    document.getElementById('hn.pitch').value      = +d.Hand_pitch;
    document.getElementById('hn.yaw').value        = +d.Hand_yaw;
    document.getElementById('hn.roll').value       = +d.Hand_roll;

    document.getElementById('hn.sphere.x').value   = d.sphere_position.x;
    document.getElementById('hn.sphere.y').value   = d.sphere_position.y;
    document.getElementById('hn.sphere.z').value   = d.sphere_position.z;
    document.getElementById('hn.sphere.r').value   = +d.Hand_sphere_r;
}

function displayFingersInfo(d) {
    for (var i = 0; i < d.num_fingers; i++) {
        document.getElementById('fg' + i + '.direction.x').value = d["finger"+i+"_direction"].x;
        document.getElementById('fg' + i + '.direction.y').value = d["finger"+i+"_direction"].y;
        document.getElementById('fg' + i + '.direction.z').value = d["finger"+i+"_direction"].z;

        document.getElementById('fg' + i + '.tip.x').value       = d["finger"+i+"_position"].x;
        document.getElementById('fg' + i + '.tip.y').value       = d["finger"+i+"_position"].y;
        document.getElementById('fg' + i + '.tip.z').value       = d["finger"+i+"_position"].z;
    }
};

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
    var orientation = new THREE.Vector3(0 - Math.PI/2, 0, 0 + Math.PI/2);

    var radius   = 60,
        segments = 64,
        material = new THREE.LineBasicMaterial( { color: 0x0000aa , linewidth: 5} ),
        geometry = new THREE.CircleGeometry( radius, segments );

    circle = new THREE.Line( geometry, material );
    circle.position = d.hand_position;
    circle.rotation.set(d.Hand_pitch - Math.PI/2, -d.Hand_roll, -d.Hand_yaw + Math.PI/2);

    scene.add(circle);

    for (var i = 0; i < d.num_fingers; i++) {
        var direction = d["finger"+i+"_direction"];

        var finger = new THREE.ArrowHelper(d["finger"+i+"_position"], direction, 40);
        finger.setColor(0xff0000);

        finger.position = d["finger"+i+"_position"];
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
};