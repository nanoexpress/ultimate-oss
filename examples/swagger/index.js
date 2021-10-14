// eslint-disable-next-line node/no-unpublished-import
import express from 'express';
import nanoexpress from '../../esm/nanoexpress.js';
import * as swagger from './swagger.js';

const app = nanoexpress();

app.setErrorHandler(function notFoundHandler(error, req, res) {
  return res.send({ error: error.stack_trace });
});

/*
 * Middlewares
 */
// Documentation middleware
app.use('/api-docs/*', swagger.serve);
app.get('/api-docs', swagger.documentation);

app.get('/', async function root() {
  return { status: 'ok' };
});

app.listen(5000);

const app2 = express();

app2.use('/api-docs', swagger.serve);
app2.get('/api-docs', swagger.documentation);

app2.get('/', async function root(req, res) {
  res.send({ status: 'ok' });
});

app2.all((req, res) => {
  res.send({ status: 404 });
});

app2.listen(7000, () => {
  console.log('HTTP Server (express) at :7000');
});
