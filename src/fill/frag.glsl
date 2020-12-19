precision mediump float;

uniform float globalAlpha;

varying vec4 fillStyle;

void main() {
    gl_FragColor = fillStyle * globalAlpha;
}
