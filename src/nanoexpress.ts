import uWS from 'uWebSockets.js';
import { INanoexpressOptions } from './types/nanoexpress';
import App from './app';

const nanoexpress = (options: INanoexpressOptions = {}): App => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  return new App(options, app);
};

export default nanoexpress;
