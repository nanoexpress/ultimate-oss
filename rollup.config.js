const external = [
  'uWebSockets.js',
  './route.js',
  './app.js',
  'events',
  'http',
  'zlib',
  'fs'
];

export default ['nanoexpress', 'route', 'app'].map((name) => ({
  input: `./src/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/${name}.js`,
    strict: false,
    exports: 'default'
  },
  external
}));
