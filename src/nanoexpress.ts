import uWS from 'uWebSockets.js';
import { INanoexpressOptions } from '../types/nanoexpress';
import App from './app';
import { exposeWebsocket } from './exposes/index';
import Router from './router';

const nanoexpress = (options: INanoexpressOptions = {}): App => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  return new App(options, app);
};

nanoexpress.Router = Router;
nanoexpress.App = App;

// Add exposes
nanoexpress.exposeWebsocket = exposeWebsocket;

export default nanoexpress;
