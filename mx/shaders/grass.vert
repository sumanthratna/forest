precision highp float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

attribute vec3 offset;
attribute vec3 seed;

uniform float time;

varying vec2 vUv;

#define PI 3.14159265

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
  float c = uv.y;
  float ma = PI*.15;
  float d = distance(vec3(0.0), position);
  float a = atan(position.y,position.x);
  float amp = cos(time*1.0+seed.y*PI*2.0)*0.5;
  vec3 newPosition = vec3(d*cos(a+c*amp*ma), d*sin(a+c*amp*ma), position.z);

  mvPosition.xyz += newPosition * ((seed.z)*60.0+25.0);
  vUv = uv;
  vUv.x*=1.0/2.0;
  vUv.y*=1.0/2.0;
  if (seed.z>0.5)
    vUv.x*=-1.0;
  vUv.y+=floor((seed.x*0.6)*2.0)/2.0;
  vUv.x+=floor(seed.y*2.0)/2.0;
  // vUv.y+=1.0/2.0;
  // vUv.x+=1.0/2.0;

  gl_Position = projectionMatrix * mvPosition;



}
