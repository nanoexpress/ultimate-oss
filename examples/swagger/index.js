// eslint-disable-next-line node/no-unpublished-import
import nanoexpress from '../../esm/nanoexpress.js';
import * as swagger from './swagger.js';

const app = nanoexpress();

app.setErrorHandler((error, req, res) =>
  res.send({ error: error.stack_trace })
);

/*
 * Middlewares
 */
// Documentation middleware
app.use('/api-docs/', ...swagger.serve, swagger.documentation);

app.get('/', async () => ({ status: 'ok' }));

app.listen(5000);
