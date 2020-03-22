uniform sampler2D mapElevation;


varying vec2 vUv;

void main() {
  vec3 newPos = position;
  vec4 elevationColor = texture2D( mapElevation, uv );
  newPos.z = elevationColor.g*0.0168*3.0*1.08;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);

}
