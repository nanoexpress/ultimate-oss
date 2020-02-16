import nanoexpress from '../src/nanoexpress.js';
import path from 'path';

const app = nanoexpress({
  https: {
    key_file_name: path.resolve('./ssl/server.key'),
    cert_file_name: path.resolve('./ssl/server.cert'),
    passphrase: '',
    separateServer: 443
  }
});

app.get('/*', async () => ({ health: 'ok' }));

app.listen(8000);
