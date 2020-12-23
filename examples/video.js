import path from 'path';
import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/video.mp4', (req, res) => {
  res.onAborted(() => {});
  req.headers = {};
  req.forEach((key, value) => {
    req.headers[key] = value;
  });
  res.sendFile(path.resolve('./examples/video/video.mp4'), true, false);
});

app.listen(4000);
