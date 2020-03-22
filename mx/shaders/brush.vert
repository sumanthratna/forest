precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 uv2;
attribute vec4 orientation;
attribute vec2 seed;

uniform float time;

varying vec2 vUv;
varying vec2 vUv2;

#define PI 3.14159265

void main() {


  float scale = 0.5*20.0+seed.x*2.0*20.0;
  vec3 vPosition = position;

  vec3 vcV = cross(orientation.xyz, vPosition);
  vPosition = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + vPosition);

  vPosition*=scale;
  vUv = uv;
  vUv2 = uv2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );

}
