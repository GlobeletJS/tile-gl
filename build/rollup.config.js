import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs"; // Needed for earcut
import { glsl } from "./glsl-plugin.js";
import pkg from "../package.json";
import { camelCase } from "./camelCase.js";

export default [{
  // Prebundle context to construct GLSL shader strings
  input: "src/main.js",
  plugins: [
    glsl(),
    resolve(),
  ],
  output: {
    file: "dist/context.bundle.js",
    format: "esm",
    name: "initGL",
  }
}, {
  input: pkg.unBundled,
  plugins: [
    resolve(),
    commonjs(),
  ],
  output: {
    file: pkg.module,
    format: "esm",
    name: camelCase(pkg.name),
  }
}, {
  input: pkg.unBundled, 
  plugins: [
    resolve(),
    commonjs(),
  ],
  output: {
    file: pkg.main,
    format: "umd",
    name: camelCase(pkg.name),
  }
}];
