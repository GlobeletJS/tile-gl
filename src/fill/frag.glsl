#version 300 es

precision mediump float;

in vec4 fillStyle;

out vec4 pixColor;

void main() {
    pixColor = fillStyle;
}
