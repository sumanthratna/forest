precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 uv2;
attribute vec2 seed;
uniform float time;

varying vec2 vUv;
varying vec2 vUv2;
varying vec2 seed2;

#define PI 3.14159265

void main() {


  float scale = 0.5*20.0+seed.x*2.0*20.0;
  vec3 vPosition = position;

  vPosition*=scale;
  vUv = uv;
  vUv2 = uv2;
  seed2 = seed;
  vPosition.y+=sin(time*0.5+seed.y*6.0)*50.0;
  vPosition.x+=cos(time*1.0+seed.x*6.0)*50.0;
  vPosition.z+=cos(time*1.0+seed.y*6.0)*sin(time*1.0+seed.x*6.0)*50.0;

  vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
  mvPosition.xyz += vPosition;




  gl_Position = projectionMatrix * mvPosition;


}
