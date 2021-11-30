#version 300 es

precision highp float;

uniform sampler2D sprite;

in float opacity;
in vec2 texCoord;

out vec4 pixColor;

void main() {
  vec4 texColor = texture(sprite, texCoord);
  // Input sprite does NOT have pre-multiplied alpha
  pixColor = vec4(texColor.rgb * texColor.a, texColor.a) * opacity;
}
