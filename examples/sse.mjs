import { PassThrough } from 'node:stream';
import nanoexpress, { useEffect } from '../esm/nanoexpress.js';

const app = nanoexpress();

app.get('/', (_req, res) => {
  return res.send({ health: 'ok' });
});

app.get('/sse', (_req, res) => {
  const sse = new PassThrough();

  useEffect(() => {
    const interval = setInterval(() => {
      sse.write(`data: ${Date.now()}\n\n`);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [sse]);

  return res.sse(sse);
});

app.listen(4000);
