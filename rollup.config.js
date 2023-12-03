// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts", // your main module file
  output: {
    file: "dist/index.js", // where the bundle will be saved
    format: "esm", // format for a browser library
    exports: "named",
    name: "OllamaSDK", // the name of the global variable for your library
  },
  plugins: [
    json(), // so Rollup can handle JSON files
    resolve({ browser: true }), // so Rollup can find your dependencies
    commonjs(), // so Rollup can handle CommonJS modules
    typescript(), // so Rollup can handle TypeScript files
  ],
};
