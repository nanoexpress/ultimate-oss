import uWS from 'uWebSockets.js';
import App from './app';
import Route from './route';
import { INanoexpressOptions } from './types/nanoexpress';

export * from './exposes/index';
export { nanoexpress, App, Route };

const nanoexpress = (options: INanoexpressOptions = {}): App => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  return new App(options, app);
};
