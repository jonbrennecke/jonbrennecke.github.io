/* Halftone shader with horizontal scanlines */

varying vec2 vUv;

uniform sampler2D tSource1;
uniform sampler2D tSource2;

const ivec2 halftoneResolution = ivec2(300);

/* Angle of halftone grid (degrees; positive = counterclockwise) */
const float angle = -45.0;

/* Contrast control */
const float contrastDelta = 1.5; // higher -> grey gets darker
const float brightness = 0.0; // analog for white
const float blackness = 1.0; // higher -> larger areas completely covered by dots

/* smoothness black to white */
const float smooth = 10.0;

const vec4 dotColor = vec4(0.0, 0.0, 0.0, 0.0);
const vec4 backgroundColor = vec4(1.0, 1.0, 1.0, 0.1);

void main(void)
{
	mat2 rotate = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
	mat2 inverse_rotate = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

	/* Distance to next dot divided by two. */ 
	vec2 halfLineDist = vec2(1.0)/vec2(halftoneResolution)/vec2(2.0);

	/* Find center of the halftone dot. */
	vec2 center =  rotate * vUv;
	center = floor(center * vec2(halftoneResolution)) / vec2(halftoneResolution);
	center += halfLineDist;
	center = inverse_rotate * center;

	/* texture is interpreted as grey scale */
	float luminance = texture2D(tSource1, center).r;

	/* Radius of the halftone dot. */
	float radius = sqrt(2.0)*halfLineDist.x*(1.0 - luminance)*blackness;

	float contrast = 1.0 + (contrastDelta)/(2.0);
	float radiusSqrd = contrast * pow(radius,2.0) - (contrastDelta * halfLineDist.x*halfLineDist.x)/2.0 - brightness * halfLineDist.x*halfLineDist.x;

	vec2 power = pow(abs(center-vUv),vec2(2.0));
	float pixelDist2 = power.x + power.y; // Distance pixel to center squared.

	float delta = smooth*pow(halfLineDist.x,2.0);
	float gradient = smoothstep(radiusSqrd-delta, radiusSqrd+delta, pixelDist2);
	gl_FragColor = mix(dotColor, backgroundColor, gradient);

	vec4 blur = texture2D( tSource2, vUv );
	gl_FragColor += blur;

	// vec4 scene = texture2D( tSource1, vUv );
	// gl_FragColor += scene;

	// add scanlines
	gl_FragColor.rgb -= mod( gl_FragCoord.y, 2.0 ) < 1.0 ? 0.5 : 0.0;

}
