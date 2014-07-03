(function() {
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
    element.appendChild(renderer.domElement);
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
    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      return renderer.render(scene, camera);
    }, false);
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

}).call(this);
