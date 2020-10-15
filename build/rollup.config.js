import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'; // Needed for earcut
import { glsl } from "./glsl-plugin.js";
//import pkg from "../package.json";

// Bundling is only needed for some sub-modules
export default [{
  input: 'src/context.js',
  plugins: [
    glsl(),
    resolve(),
    commonjs(),
  ],
  output: {
    file: 'dist/context.bundle.js',
    //sourcemap: 'inline',
    format: 'esm',
    name: 'initGLpaint',
  }
}, {
  input: 'src/serializers/fill.js',
  plugins: [
    resolve(),
    commonjs(),
  ],
  output: {
    file: 'dist/fill.bundle.js',
    format: 'esm',
    name: 'parseFill',
  }
}];
