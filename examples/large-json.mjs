import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const json_obj = {};

let startTime = Date.now();

while (Date.now() - startTime < 500) {
  for (let i = 0; i < 2; i++) {
    json_obj[(Math.random() * i * 1000).toString(16)] =
      Math.random() * i * 1000;
  }
}

writeFile(path.resolve('large.json'), JSON.stringify(json_obj));
