import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.use(async (req) => {
  req.headers = {};
  req.headers.host = req.getHeader('host');
});

app.get(
  '/',
  {
    schema: {
      headers: {
        type: 'object',
        properties: {
          host: { type: 'string' }
        }
      },
      query: false,
      cookies: false,
      params: false,
      response: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          host: { type: 'string' }
        }
      }
    }
  },
  async (req) => ({ hello: 'world', host: req.headers.host })
);

app.listen(4000);
