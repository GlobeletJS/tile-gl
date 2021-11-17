precision highp float;

uniform sampler2D sprite;

varying vec2 texCoord;

void main() {
  vec4 texColor = texture2D(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  gl_FragColor = vec4(texColor.rgb * texColor.a, texColor.a);
}
