import fs from 'node:fs';
import path from 'node:path';
import nanoexpress from '../esm/nanoexpress.js';

const app = nanoexpress();

app.get('/router.js', async (_req, res) => {
  return fs.createReadStream(path.resolve('examples', 'router.js')).pipe(res);
});
app.get('/router1.js', async (_req, res) => {
  return res.stream(fs.createReadStream(path.resolve('examples', 'router.js')));
});

app.listen(8000);
