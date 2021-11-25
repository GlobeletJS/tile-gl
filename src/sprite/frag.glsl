precision highp float;

uniform sampler2D sprite;

varying float opacity;
varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  gl_FragColor = vec4(texColor.rgb * texColor.a, texColor.a) * opacity;
}
