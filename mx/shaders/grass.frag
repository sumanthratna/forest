precision highp float;

uniform sampler2D map;

varying vec2 vUv;

uniform vec3 fogColor;
uniform float fogDensity;
uniform float depthFactor;
uniform float mNear;
uniform float mFar;


#define LOG2 1.442695
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )

void main() {

  vec4 diffuseColor = texture2D( map, vUv );

  vec3 outgoingLight = diffuseColor.rgb;

  float depth = gl_FragCoord.z / gl_FragCoord.w;


  float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );
  outgoingLight = mix( outgoingLight, fogColor, fogFactor );


  if ( diffuseColor.w < 0.5 ) discard;

  vec3 depthColor = vec3( 1.0-fogFactor );
  gl_FragColor = vec4(mix(outgoingLight,depthColor,depthFactor) , 1.0);

}
