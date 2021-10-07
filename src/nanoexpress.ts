import uWS from 'uWebSockets.js';
import App from './app';
import { exposeWebsocket } from './exposes/index';
import Route from './route';
import { INanoexpressOptions } from '../types/nanoexpress';

const nanoexpress = (options: INanoexpressOptions = {}): App => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  return new App(options, app);
};

nanoexpress.Router = Route;
nanoexpress.App = App;

// Add exposes
nanoexpress.exposeWebsocket = exposeWebsocket;

export default nanoexpress;
