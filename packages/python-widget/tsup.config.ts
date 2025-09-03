import { defineConfig } from 'tsup';
// import path from 'path';


export default [defineConfig({
  entry: ['./js/widget.tsx'],
  bundle: true,
  minify: false,
  target: 'es2022',
  outDir: 'src/numeric_data_layer_widget/static/',
  format: 'esm',
  define: {
    'define.amd': 'false',
  },
  // Need it outside of workspace
  // alias: {
  //   'deck.gl': path.resolve('./node_modules/deck.gl'),
  //   '@loaders.gl': path.resolve('./node_modules/@loaders.gl'),
  //   '@deck.gl/layers': path.resolve('./node_modules/@deck.gl/layers'),
  //   '@deck.gl/core': path.resolve('./node_modules/@deck.gl/core'),
  //   '@deck.gl/geo-layers': path.resolve('./node_modules/@deck.gl/geo-layers'),
  //   '@deck.gl/react': path.resolve('./node_modules/@deck.gl/react'),
  // },
  
  // Code splitting didn't work initially because it tried to load from a local
  // relative path ./chunk.js
  // splitting: true,
  
  onSuccess: async (): Promise<void> => {
    console.log('Widget build Completed.');
  }
})];