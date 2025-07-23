import { defineConfig, type Options } from "tsup";

const baseOptions: Options = {
  clean: true,
  minify: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es6",
  tsconfig: "./tsconfig.json",
  keepNames: true,
  cjsInterop: true,
  splitting: true,
};

export default [
  defineConfig({
    ...baseOptions,
    entry: ["src/index.ts"],
    outDir: "dist/esm",
    format: "esm",
    dts: true,
    onSuccess: async (): Promise<void> => {
      console.log('Build Completed.');
    }
  })
];