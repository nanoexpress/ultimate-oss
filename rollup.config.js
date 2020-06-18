const external = [
  'uWebSockets.js',
  './Route.js',
  './App.js',
  'events',
  'http',
  'zlib',
  'fs'
];

export default ['nanoexpress', 'Route', 'App'].map((name) => ({
  input: `./src/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/${name}.js`,
    strict: false
  },
  external
}));
