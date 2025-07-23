import { defineConfig, type Options } from "tsup";

const baseOptions: Options = {
  clean: true,
  minify: true,
  skipNodeModulesBundle: true,
  sourcemap: true,
  target: "es6",
  tsconfig: "./tsconfig.json",
  cjsInterop: true
};

export default [
  defineConfig({
    ...baseOptions,
    entry: ["src/index.ts"],
    outDir: "dist/esm",
    format: "esm",
    
    onSuccess: async (): Promise<void> => {
      console.log('Build Completed.');
    }
  })
];