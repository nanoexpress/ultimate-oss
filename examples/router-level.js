const nanoexpress = require('../cjs');
const uWS = require('uWebSockets.js');

const level1 = () => {
  const route = new nanoexpress.Router();

  route.get('/', (req, res) => {
    res.end('level 1 route');
  });

  return route;
};

const level2 = () => {
  const route = new nanoexpress.Router();

  route.get('/', (req, res) => {
    res.end('level 2 route');
  });

  return route;
};

const app = nanoexpress();

const l1 = level1();
l1.use('/l2', level2());

app.use('/l1', l1);

app.get('/', (req, res) => {
  res.end('index');
});

app.listen(8000);

/**
 * ****
 */

// uWS
const app2 = uWS.App();

const keys = [];
app2.get('/', async (response) => {
  response.end('index');
});

// eslint-disable-next-line no-console
app2.listen(5000, (token) => token && console.log('listen to 5000'));
