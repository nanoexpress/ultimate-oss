import nanoexpress from '../src/nanoexpress';

const app = nanoexpress();

app.use(async (req) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'].includes('application/json')
  ) {
    let body = '';
    for await (const chunk of req) {
      body += chunk.toString();
    }
    req.body = JSON.parse(body);
  }
});

app.get('/', (_, res) => res.end('ok'));

app.post<{ headers: { origin: string }; body: { foo: 'bar' } }>(
  '/',
  async (req, res) => {
    req.pipe(res);
  }
);

app.listen(4002);
