import nanoexpress from '../esm';

const app = nanoexpress();

app.use(async (req) => {
  if (
    req.method === 'POST' &&
    req.headers['content-type'] === 'application/json'
  ) {
    let body = '';
    req.stream.on('data', (chunk) => {
      console.log('chunk??', chunk.toString());
      body += chunk.toString();
    });
    await new Promise((resolve) =>
      req.stream.on('end', () => {
        if (body) {
          req.body = JSON.parse(body);
        }
        resolve();
      })
    );
  }
});

app.get('/', (req, res) => res.end('ok'));

app.post('/', async (req, res) => {
  req.pipe(res);
});

app.listen(4002);
