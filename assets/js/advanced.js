init = function() {
  // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
  var controller, cursor, initScene, stats;

  window.scene = null;

  window.renderer = null;

  window.camera = null;

  initScene = function(element) {
    var axis, pointLight;
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("canvas-container").appendChild(renderer.domElement);
    axis = new THREE.AxisHelper(5);
    scene.add(axis);
    scene.add(new THREE.AmbientLight(0x888888));
    pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(-20, 10, 0);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(pointLight);
    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.fromArray([0, 40, 24]);
    camera.lookAt(new THREE.Vector3(0,10,0));
    scene.add(camera);
    window.addEventListener('resize', resizeCanvas, false);
    return renderer.render(scene, camera);
  };

  // via Detector.js:
var webglAvailable  = ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
  if (webglAvailable) {
    initScene(document.body);
  }

  window.controller = controller = new Leap.Controller;

  controller.use('handHold').use('handEntry').use('screenPosition').use('riggedHand', {
    parent: scene,
    renderer: renderer,
    scale: getParam('scale'),
    positionScale: getParam('positionScale'),
    offset: new THREE.Vector3(0, 0, 0),
    renderFn: function() {
      renderer.render(scene, camera);
    },
    materialOptions: {
      wireframe: getParam('wireframe')
    },
    dotsMode: getParam('dots'),
    stats: stats,
    camera: camera,
    checkWebGL: true
  }).connect();

};

function resizeCanvas() {
      var width = document.getElementById("canvas-container").offsetWidth;
      console.log(width);
      camera.aspect = width / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 400);
      return renderer.render(scene, camera);
}

function getParameterByName(name, remove) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(queryString);

    if (remove && results != null)
        queryString = queryString.substring(queryString.indexOf(results[0]) + results[0].length);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var queryString = location.search;

$(document).ready(function() {
  init();
  resizeCanvas();

  var gesture = getParameterByName("gesture", true);

  document.getElementById("gesture").value = gesture;
  document.getElementById("gesture-image").innerHTML = (gesture.length == 0) ?
      "No gesture selected!" : "<img src=../assets/img/"+ gesture + "_snapshot.png>";

  var
      control = getParameterByName("control", false);
  document.getElementById("Control").value = control;
});
