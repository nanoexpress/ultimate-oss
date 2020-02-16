import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/*', async () => ({ health: 'ok' }));

app.listen([3000, 4000]);
