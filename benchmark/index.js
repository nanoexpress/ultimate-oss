import { fork } from 'child_process';
import path from 'path';

const nanoexpress = fork(
  path.resolve('benchmark', 'servers', 'nanoexpress.js')
);
const uWS = fork(path.resolve('benchmark', 'servers', 'uws.js'));

export { nanoexpress, uWS };
