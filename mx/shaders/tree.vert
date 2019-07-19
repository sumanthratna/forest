precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 uv2;
attribute vec4 orientation;
attribute vec3 seed;

uniform float time;

varying vec2 vUv;
varying vec2 vUv2;

#define PI 3.14159265

void main() {

  float scale = 0.7+seed.x*1.8;
  float amp = cos(time*1.0+seed.y*PI*2.0)*0.8*.0055*scale;
  scale*=30.0;
  float c = position.y;
  float d = distance(vec3(0.0), position);
  float a = atan(position.y,position.x);
  vec3 vPosition = vec3(d*cos(a+c*amp), d*sin(a+c*amp), position.z);

  vec3 vcV = cross(orientation.xyz, vPosition);
  vPosition = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + vPosition);

  vPosition*=scale;
  vUv = uv;
  vUv2 = uv2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );

}
