precision highp float;

uniform sampler2D map;
uniform sampler2D ao;
uniform vec3 fogColor;
uniform float fogDensity;
uniform float mNear;
uniform float mFar;
uniform float depthFactor;

varying vec2 vUv;
varying vec2 vUv2;

#define LOG2 1.442695
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )
void main() {


  vec4 diffuseColor = texture2D( map, vUv );
  vec4 aoColor = texture2D( ao, vUv2 );
  vec3 shadow = vec3(0.0);
  vec3 outgoingLight = mix(diffuseColor.rgb, shadow, (1.0-aoColor.r)*0.8);
  // outgoingLight = diffuseColor.rgb;
  // outgoingLight = aoColor.rgb;


  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );
  outgoingLight = mix( outgoingLight, fogColor, fogFactor );

  if ( diffuseColor.w < 0.3 ) discard;

  vec3 depthColor = vec3( 1.0-fogFactor );
  gl_FragColor = vec4(mix(outgoingLight,depthColor,depthFactor) , 1.0);

}
