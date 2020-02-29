import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress({
  json_spaces: 2
});

app.get('/', async () => ({ status: 'ok' }));

app.listen(8000);
