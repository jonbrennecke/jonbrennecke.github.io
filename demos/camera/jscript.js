/**
* 	Flying First-Person Camera Controls 
*/

var clock = new THREE.Clock(),
	keyboard = new THREEx.KeyboardState(),
	mouse = new THREE.Vector2(),
	offset = new THREE.Vector3();

Controls = function() {
	this.pause = false;
	camera.position.set(100,500,200);
	camera.lookAt(new THREE.Vector3(500,0,500));
};

Controls.prototype = {
	pauseControls: function() {
		this.pause = true;
	},

	unpauseControls: function() {
		this.pause = false;
	},

	update: function() {
		if(this.pause === false) {
			camera.matrixAutoUpdate = false;
			camera.updateMatrix();
			var delta = clock.getDelta(); // seconds.
	    	var moveDistance = 200 * delta; // 200 pixels per second
	
			var vector = new THREE.Vector3( .03*mouse.x, .05*mouse.y, .05 );
		    projector.unprojectVector( vector, camera );
		    var ray = new THREE.Ray( camera.position, vector.sub( camera.position ).normalize() );

		    // rotate the camera towards ray
		   	camera.lookAt(ray.at(100));
		    camera.updateMatrix();
		    
			if ( keyboard.pressed("W") ) {
				camera.translate( moveDistance, camera._vector.set(0,0,-1) );
				camera.updateMatrix();
			}
			if ( keyboard.pressed("S") ) {
				camera.translateZ(  moveDistance );
			}					
			if ( keyboard.pressed("A") ) {
				camera.translate( moveDistance, camera._vector.set(-1,0,0) );
				camera.updateMatrix();
			}
			if ( keyboard.pressed("D") ) {
				camera.translate( moveDistance, camera._vector.set(1,0,0) );
				camera.updateMatrix();
			}
		}
	}
};

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

// create scene elements
var scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, .9, 1250);  
	renderer = new THREE.WebGLRenderer( {antialias:true} ),
	projector = new THREE.Projector(),
	directionalLight = new THREE.DirectionalLight(0xffffff, 2.0),
	controls = new Controls();

directionalLight.position.set(400,600,400);

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 400, 600, 400 );
spotLight.castShadow = true;
spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;
spotLight.shadowCameraNear = 500;
spotLight.shadowCameraFar = 4000;
spotLight.shadowCameraFov = 30;
scene.add( spotLight );
scene.add(directionalLight);
camera.position.set(200,200,200);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.lookAt( new THREE.Vector3(0,0,0) );


// create cube and materials
var geometry = new THREE.CubeGeometry( 40, 40, 40, 1, 1, 1),
	material = new THREE.MeshPhongMaterial( { specular: 0xb0a6d2, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

for ( var i = 0; i < geometry.faces.length; i++ ) {
	var face = geometry.faces[ i ];
	face.vertexColors[ 0 ] = new THREE.Color().setHSV( Math.random() * 0.1 + 0.5, 0.71, Math.random() * 0.75 + 0.25 );
	face.vertexColors[ 1 ] = new THREE.Color().setHSV( Math.random() * 0.1 + 0.5, 0.71, Math.random() * 0.75 + 0.25 );
	face.vertexColors[ 2 ] = new THREE.Color().setHSV( Math.random() * 0.1 + 0.5, 0.71, Math.random() * 0.75 + 0.25 );
	face.vertexColors[ 3 ] = new THREE.Color().setHSV( Math.random() * 0.1 + 0.5, 0.71, Math.random() * 0.75 + 0.25 );
}

var cube = new THREE.Mesh( geometry, material);
var cubeArray = [],
	min = 500,
	max = -500;

// clone the cube
for(var i=0;i<200;i++) {
	cubeArray.push(cube.clone());
	cubeArray[i].position.set(min + ~~(Math.random()*max),min + ~~(Math.random()*max),min + ~~(Math.random()*max));
	cubeArray[i].material.color.setHSV( Math.random() * 1 + 0.75, 0.75, Math.random() * 0.25 + 0.75 );
	cubeArray[i].rotation.set(Math.random(),Math.random(),Math.random());
	scene.add(cubeArray[i]);
}

window.addEventListener('keydown', function(e) {
	if(e.keyCode === 27) {
		if(controls.pause === true) {
			controls.unpauseControls();
		}
		else controls.pauseControls();
	}
}, false);

window.addEventListener('mousemove', function(e) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}, false);

// animation callback function
requestAnimFrame = ( function() {
	return window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element ) {
			window.setTimeout(callback,20);
		};
}) ();

function render() { 
	requestAnimFrame(render); 
	renderer.render(scene, camera); 
	controls.update();
} 

function init() {
	render();
}

window.onload = init;