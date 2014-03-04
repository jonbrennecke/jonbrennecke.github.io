/**
*	3D Simplex Noise generator
*	based on simplex algorithm by Ken Perlin / http://mrl.nyu.edu/~perlin/noise/
*	converted to javascript by @jonbrennecke
*/

SimplexNoise = function() {
	this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
		 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
		 174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
		 133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
		 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
		 202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
		 248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
		 178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
		 14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
		 93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

	for (var i=0; i < 256 ; i++) {
		this.p[256+i] = this.p[i];
	}
};

SimplexNoise.prototype = {

	noise: function(x,y,z) {
		var floorX = ~~x, floorY = ~~y, floorZ = ~~z;
			X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;
			x -= ~~x; y-= ~~y; z -= ~~z;
		var u = this.fade(x), v=this.fade(y), w = this.fade(z),
			A = this.p[X]+Y,   AA = this.p[A]+Z, AB = this.p[A+1]+Z,
			B = this.p[X+1]+Y, BA = this.p[B]+Z, BB = this.p[B+1]+Z;
	
		return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA   ], x  , y  , z   ), 
					                                   this.grad(this.p[BA  ], x-1, y  , z   )), 
					                      this.lerp(u, this.grad(this.p[AB  ], x  , y-1, z   ),  
					                                   this.grad(this.p[BB  ], x-1, y-1, z   ))),
					         this.lerp(v, this.lerp(u, this.grad(this.p[AA+1], x  , y  , z-1 ),  
					                                   this.grad(this.p[BA+1], x-1, y  , z-1 )), 
					                      this.lerp(u, this.grad(this.p[AB+1], x  , y-1, z-1 ),
					                                   this.grad(this.p[BB+1], x-1, y-1, z-1 ))));
		// console.log(c);
		// return c;
	}, 

	/* smoothing function */
	fade: function(t) { return t * t * t * (t * (t * 6 - 15) + 10); },

	/* Linear interpolation */
	lerp: function(t,a,b) { return a + t * (b - a); },

	/* gradient function */
	grad: function(hash, x,y,z) {
		var h = hash & 15;                 
      	var u = h<8 ? x : y,                 
            v = h<4 ? y : h==12||h==14 ? x : z;
      	return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	},

	generate : function(quality, octaves, width, depth) {
		var	output = [], 
			s = width*depth, 
			z = Math.random()*100;

		for (var j=0;j<octaves;j++) {
			if ( j == 0 ) for ( var i = 0; i < s; i++ ) output[ i ] = 0;
			for (var i=0;i<s; i++) {
				var x = i % width, y = ~~(i/width);
				output[i] += this.noise( x /quality, y / quality, z ) * quality;
			}
			quality *= 4;
		}
		return output;
	}
};
/* ------------------------------------------------ */

var scene,
	camera,
	renderer,
	projector;

// ininialize the scene elements
scene = new THREE.Scene(); 
camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, .9, 1250);  
renderer = new THREE.WebGLRenderer( {antialias:true} ); 
renderer.setSize(window.innerWidth, window.innerHeight); 
projector = new THREE.Projector();
var d = document.body.appendChild(renderer.domElement);
var directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(400,600,400);
scene.add(directionalLight);
camera.position.set(1100,100,1000);
camera.lookAt(new THREE.Vector3(0,0,0));

// call the simplex algorithm
var width = 160, depth = 160,
	simplex = new SimplexNoise(),
	noise = simplex.generate(2,3,width,depth);

// // compute the geometry
var vertices = [];

for(var i=0;i<width;i++) {
	for(var j=0;j<depth;j++){ 
		var height = ~~(noise[ j + i * width ] * 4 );
		vertices.push( new THREE.Vector3( i*6, height, j*6 ) );
	}
}

var planeGeometry = new THREE.PlaneGeometry( width*10, depth*10, width-1, depth-1 )

planeGeometry.vertices = vertices;

var material = new THREE.MeshLambertMaterial({
	color : Math.random()*0xffffff,
	wireframe : true,
	morphTargets : true
});

var mesh = new THREE.Mesh(planeGeometry, material);

// create 15 morph targets
var noise2 = [];
for(var k=0;k<15; k++) {
	noise2.push(simplex.generate(2,3,width,depth)); 
	var vertices = [];

	for(var i=0;i<width; i++) {
		for(var j=0;j<depth;j++){ 
			var height = ~~(noise2[k][ j + i * width ] * 4 );
			vertices.push( new THREE.Vector3( i*6, height, j*6 ) );
		}
	}

	mesh.geometry.morphTargets.push( { name: "target" + k, vertices : vertices } );
}

mesh.updateMorphTargets();
scene.add(mesh);


/* ------------------------------------------------ */
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


var duration = 30000;
var keyframes = 15, interpolation = duration / keyframes;
var lastKeyframe = 0, currentKeyframe = 0;

function render() { 

	// Animate Morph targets

	var time = Date.now() % duration;

	var keyframe = Math.floor( time / interpolation );

	if ( keyframe != currentKeyframe ) {

		mesh.morphTargetInfluences[ lastKeyframe ] = 0;
		mesh.morphTargetInfluences[ currentKeyframe ] = 1;
		mesh.morphTargetInfluences[ keyframe ] = 0;

		lastKeyframe = currentKeyframe;
		currentKeyframe = keyframe;
	}

	mesh.morphTargetInfluences[ keyframe ] = ( time % interpolation ) / interpolation;
	mesh.morphTargetInfluences[ lastKeyframe ] = 1 - mesh.morphTargetInfluences[ keyframe ];

	requestAnimFrame(render); 
	renderer.render(scene, camera); 
} 

function init() {
	render();
}

window.onload = init;