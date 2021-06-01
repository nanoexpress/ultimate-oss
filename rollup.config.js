const external = [
  'uWebSockets.js',
  './route.js',
  './find-route.ts',
  './app.js',
  'events',
  'http',
  'zlib',
  'fs'
];

export default ['nanoexpress', 'route', 'app'].map((name) => ({
  input: `./src/${name}.ts`,
  output: {
    format: 'cjs',
    file: `./cjs/${name}.js`,
    strict: false,
    exports: 'default'
  },
  external
}));
