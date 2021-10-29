import nanoexpress from '../esm';

const app = nanoexpress();

app.use(async (req) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'].includes('application/json')
  ) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    await new Promise((resolve) =>
      req.on('end', () => {
        req.body = JSON.parse(body);
        resolve();
      })
    );
  }
});

app.get('/', (req, res) => res.end('ok'));

app.post('/', async (req, res) => {
  console.log('ran post');
  req.pipe(res);
});

app.listen(4002);
