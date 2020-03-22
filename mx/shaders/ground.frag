precision highp float;

uniform sampler2D splatMap;
uniform sampler2D heightMap;
uniform sampler2D aoMap;
uniform sampler2D map;
uniform sampler2D map2;
uniform sampler2D map3;

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

  vec4 diffuseColor1 = texture2D( map, vUv*30.0 );
  vec4 diffuseColor2 = texture2D( map2, vUv*30.0 );
  vec4 diffuseColor3 = texture2D( map3, vUv*30.0 );
  vec4 aoColor = texture2D( aoMap, vUv*1.0 );
  vec4 mixColor = texture2D( splatMap, vUv*1.0 );

  vec3 outgoingLight = mix(diffuseColor1.rgb, diffuseColor2.rgb, mixColor.r);
  outgoingLight = mix(outgoingLight, diffuseColor3.rgb, mixColor.g);
  outgoingLight = mix(outgoingLight, diffuseColor3.rgb, aoColor.a);
  vec3 shadowColor = vec3(0.0);
  outgoingLight = mix(outgoingLight, shadowColor, 0.7*aoColor.a*aoColor.r);
  // outgoingLight = aoColor.rgb;
  

  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );
  outgoingLight = mix( outgoingLight, fogColor, fogFactor );

  vec3 depthColor = vec3( 1.0-fogFactor );
  
  gl_FragColor = vec4(mix(outgoingLight,depthColor,depthFactor) , 1.0);

}
