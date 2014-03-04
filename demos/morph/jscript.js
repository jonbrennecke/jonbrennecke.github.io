/**
* 	Morph Targets Animation by @jonbrennecke
*	based on http://threejs.org/examples/webgl_morphtargets_horse.html by @mirada
*/

// create the background gradient
container = document.createElement( 'div' );
document.body.appendChild( container );

var canvas = document.createElement( 'canvas' );
	canvas.width = 32;
	canvas.height = window.innerHeight;
	var ctx = canvas.getContext( '2d' ),
		gradient = ctx.createLinearGradient( 0, 0, 0, canvas.height );
	gradient.addColorStop(0, "#80bff9");
	gradient.addColorStop(0.5, "#d8ecff");

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
	container.style.backgroundSize = '32px 100%';

var clock = new THREE.Clock(),
	keyboard = new THREEx.KeyboardState(),
	mouse = new THREE.Vector2(),
	offset = new THREE.Vector3();

// create scene elements
var scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, .9, 1250);  
	renderer = new THREE.WebGLRenderer( {antialias:true} ),
	projector = new THREE.Projector(),
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);

directionalLight.position.set(400,600,400);

var spotLight = new THREE.SpotLight( 0xffffff);
spotLight.position.set( 400, 600, 400 );
spotLight.castShadow = true;
spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;
spotLight.shadowCameraNear = 500;
spotLight.shadowCameraFar = 4000;
spotLight.shadowCameraFov = 30;
scene.add( spotLight );
scene.add(directionalLight);
camera.position.set(58,250,260);
camera.lookAt(new THREE.Vector3(0,0,0));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var dog;
var loader = new THREE.JSONLoader();
loader.load( "models/dog.js", 
function (geometry) { 
	var material = new THREE.MeshLambertMaterial({
		color : 0xb1926c,
		morphTargets: true,
		// shading: THREE.FlatShading,
		side : THREE.DoubleSide,
		shininess : 10
	});
	dog = new THREE.Mesh(geometry, material);
	dog.position.set(0,-100,0);
	dog.scale.set(50,50,50);
	scene.add(dog);
});

// animation callback function
requestAnimFrame = ( function() {
	return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element ) {
			window.setTimout(callback,20);
		};
}) ();

var duration = 1500;
var keyframes = 8, interpolation = duration / keyframes;
var lastKeyframe = 0, currentKeyframe = 0;

function render() { 
	if( dog ) {
		var time = Date.now() % duration;

		var keyframe = Math.floor( time / interpolation );

		if ( keyframe != currentKeyframe ) {

			dog.morphTargetInfluences[ lastKeyframe ] = 0;
			dog.morphTargetInfluences[ currentKeyframe ] = 1;
			dog.morphTargetInfluences[ keyframe ] = 0;

			lastKeyframe = currentKeyframe;
			currentKeyframe = keyframe;
		}

		dog.morphTargetInfluences[ keyframe ] = ( time % interpolation ) / interpolation;
		dog.morphTargetInfluences[ lastKeyframe ] = 1 - dog.morphTargetInfluences[ keyframe ];

	}

		var delta = clock.getDelta(); // seconds.
	   	var moveDistance = 500 * delta; // 200 pixels per second
	
		  	if ( keyboard.pressed("W") ) {
			dog.translate(moveDistance, dog._vector.set(0,0,1) );
		}
		if ( keyboard.pressed("S") ) {
			dog.translateZ(  -moveDistance );
		}					
		if ( keyboard.pressed("A") ) {
			dog.translate( moveDistance, camera._vector.set(-1,0,0) );
		}
		if ( keyboard.pressed("D") ) {
			dog.translate( moveDistance, camera._vector.set(1,0,0) );
		}
	
	requestAnimFrame(render); 
	renderer.render(scene, camera); 
} 

function init() {
	render();
}

window.onload = init;