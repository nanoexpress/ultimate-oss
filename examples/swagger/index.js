// eslint-disable-next-line node/no-unpublished-import
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
app.use(swagger.serve);
app.get('/api-docs', swagger.documentation);

(async () => {
  const req = {
    method: 'GET',
    url: '/swagger-ui-init.js',
    path: '/swagger-ui-init.js'
  };
  const res = {
    emit(...args) {
      console.log('emit', args);
    },
    on(...args) {
      console.log('on', args);
    },
    once(...args) {
      console.log('once', args);
    },
    pipe(...args) {
      console.log('pipe');
    },
    set(key, value) {
      console.log('set', key, value);
    },
    end() {
      console.log('end');
    }
  };
  res.send = (data) => {};

  for await (const serve of swagger.serve) {
    await new Promise((resolve, reject) =>
      serve(req, res, (err) => (err ? rejects(err) : resolve()))
    );
  }

  await new Promise((resolve, reject) =>
    swagger.documentation(req, res, (err) => (err ? rejects(err) : resolve()))
  );
})();

app.get('/', async function root() {
  return { status: 'ok' };
});

app.listen(5000);
