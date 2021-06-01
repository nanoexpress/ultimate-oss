import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { dependencies } from './package.json';

const external = Object.keys(dependencies).concat([
  'events',
  'http',
  'zlib',
  'fs'
]);

export default ['nanoexpress', 'route', 'app'].map((name) => ({
  input: `./src/${name}.ts`,
  output: [
    {
      format: 'esm',
      file: `./esm/${name}.js`,
      strict: true,
      sourcemap: true,
      exports: 'default'
    },
    {
      format: 'cjs',
      file: `./cjs/${name}.js`,
      strict: true,
      sourcemap: true,
      exports: 'default'
    }
  ],
  plugins: [
    resolve({ extensions: ['.ts', '.d.ts'] }),
    typescript({
      rollupCommonJSResolveHack: false,
      clean: true,
      tsconfigOverride: {
        include: ['src'],
        exclude: ['examples', 'utils'],
        compilerOptions: { rootDir: 'src' }
      },
      useTsconfigDeclarationDir: true
    })
  ],
  external
}));
