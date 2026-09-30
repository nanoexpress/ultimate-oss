import nanoexpress from '../esm';

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

app.get('/', (req, res) => res.end('ok'));

app.post('/', async (req, res) => {
  return { status: 'success', body: req.body };
});

app.listen(4002);
