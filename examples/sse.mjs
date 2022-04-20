import { randomUUID } from 'crypto';
import { PassThrough } from 'stream';
import nanoexpress, { useEffect } from '../esm/nanoexpress.js';

const app = nanoexpress();

app.get('/', (req, res) => {
  return res.send({ health: 'ok' });
});

app.get('/sse', (req, res) => {
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
