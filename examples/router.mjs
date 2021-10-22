import { pathToRegexp } from 'path-to-regexp';
import uWS from 'uWebSockets.js';
import nanoexpress from '../esm/nanoexpress.js';
import express from './swagger/node_modules/express/index.js';

const app = nanoexpress();
app.setNotFoundHandler((req, res) => {
  res.status(404);
  res.send({ status: 'error' });
});
app
  .get('/', (_, response) => {
    response.end('');
  })
  .get('/ip', (req, response) => {
    response.end(req.ip);
  })
  .get('/user/:id', (req, response) => {
    response.end(req.params.id);
  })
  .post('/user', (request, response) => {
    response.end('');
  })
  .get('/test/simple/:id', async (req) => ({
    id: req.params.id
  }));

app.listen(4000);

const app2 = express();
app2
  .get('/', (_, response) => {
    response.end('');
  })
  .get('/user/:id', (request, response) => {
    response.end(request.params.id);
  })
  .post('/user', (request, response) => {
    response.end('');
  })
  .get('/test/simple/:id', async (request) => ({
    id: request.params.id
  }));

app2.listen(4100, () => console.log('express.js listening at :4100'));

// uWS
const app3 = uWS.App();

const keys = [];
const regex = pathToRegexp('/profile/:id', keys);
app3
  .get('/', async (response) => {
    response.end('');
  })
  .get('/user/:id', async (response, request) =>
    response.end(request.getParameter(0))
  )
  .get('/profile/:id', async (response, request) => {
    request.path = request.getUrl();
    const id = regex.exec(request.path);

    response.end(id[1]);
  })
  .post('/user', async (response) => {
    response.end('');
  })
  .get('/test/simple/:id', async (response, request) =>
    response.end(
      JSON.stringify({
        id: request.params.id
      })
    )
  );

// eslint-disable-next-line no-console
app3.listen(4200, (token) => token && console.log('listen to 4200'));
