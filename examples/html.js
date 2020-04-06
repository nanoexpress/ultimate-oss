import nanoexpress from '../src/nanoexpress.js';
import path from 'path';

const app = nanoexpress();

app.get('/*', (req, res) => {
  req.headers = {};
  req.forEach((key, value) => {
    req.headers[key] = value;
  });
  res.sendFile(path.resolve('./examples/index.html'), true, false);
});

app.listen(4000);
