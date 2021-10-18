import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'; // Needed for earcut
import { glsl } from "./glsl-plugin.js";
//import pkg from "../package.json";

// Bundling is only needed for some sub-modules
export default [{
  input: 'src/main.js',
  plugins: [
    glsl(),
    resolve(),
    commonjs(),
  ],
  output: {
    file: 'dist/context.bundle.js',
    format: 'esm',
    name: 'initGLpaint',
  }
}, {
  input: 'src/serialize/tile.js',
  plugins: [
    resolve(),
    commonjs(),
  ],
  external: ['pbf-esm'],
  treeshake: { moduleSideEffects: "no-external" },
  output: {
    file: 'dist/serializer.bundle.js',
    format: 'esm',
    name: 'initTileSerializer',
  }
}];
