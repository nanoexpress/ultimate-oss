import uWS from 'uWebSockets.js';

import Route from './Route.js';
import App from './App.js';

const nanoexpress = (options = {}) => {
  let app;

  if (options.https && options.isSSL !== false) {
    app = uWS.SSLApp(options.https);
  } else {
    app = uWS.App();
  }

  // Initialize Route instance
  const routeInstance = new Route();
  routeInstance._app = app;
  routeInstance._config = options;
  routeInstance._rootLevel = true;

  // Initialize App instance
  const appInstance = new App(options, app, routeInstance);
  appInstance.wraps = Route.wraps;

  return appInstance;
};

export { nanoexpress as default };
