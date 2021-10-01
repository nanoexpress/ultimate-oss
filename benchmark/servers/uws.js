import { pathToRegexp } from 'path-to-regexp';
import uWS from 'uWebSockets.js';

const app = uWS.App();

const keys = [];
const regex = pathToRegexp('/profile/:id', keys);
app
  .get('/', async (_, response) => {
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
app.listen(5000, (token) => token && console.log('listen to 5000'));
