import { fork } from 'node:child_process';
import path from 'node:path';

const nanoexpress = fork(
  path.resolve('benchmark', 'servers', 'nanoexpress.js')
);
const uWS = fork(path.resolve('benchmark', 'servers', 'uws.js'));

export { nanoexpress, uWS };
