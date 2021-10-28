import nanoexpress from '../esm';

const app = nanoexpress();

app.use(async (req) => {
  if (req.method === 'POST') {
    let body = '';
    req.stream.on('data', (chunk) => {
      body += chunk.toString();
    });
    await new Promise((resolve) =>
      req.stream.on('end', () => {
        req.body = JSON.parse(body);
        resolve();
      })
    );
  }
});

app.get('/', (req, res) => res.end('ok'));

app.post('/', (req, res) => {
  // res.stream(req.stream);
  res.pipe(req);
  // res.send({ baz: req.body.foo });
});

app.listen(4002);
