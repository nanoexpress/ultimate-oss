const external = [
  'uWebSockets.js',
  './Route.js',
  './app.js',
  'events',
  'http',
  'zlib',
  'fs'
];

export default ['nanoexpress', 'Route', 'app'].map((name) => ({
  input: `./src/${name}.js`,
  output: {
    format: 'cjs',
    file: `./cjs/${name}.js`,
    strict: false
  },
  external
}));
