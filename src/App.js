import uWS from 'uWebSockets.js';

import { httpMethods } from './constants.js';

export default class App {
  get config() {
    return this._config;
  }
  get host() {
    const { _config: config } = this;
    return config.host;
  }
  get port() {
    const { _config: config } = this;
    return config.port;
  }
  get address() {
    const { _config: config } = this;
    let address = '';
    if (config.host) {
      address += config.https ? 'https://' : 'http://';
      address += config.host || 'localhost';

      if (config.port) {
        address += ':' + config.port;
      }
    }

    return address;
  }
  get https() {
    return this._config.https !== undefined && this._config.isSSL !== false;
  }
  get _console() {
    return this._config.console || console;
  }
  get raw() {
    return this._app;
  }
  constructor(config, app, route) {
    this._config = config;
    this._app = app;
    this._route = route;

    this.time = Date.now();

    this._instance = null;

    this._routeCalled = false;
    this._optionsCalled = false;

    if (config && !config._errorHandler) {
      config._errorHandler = (err) => ({
        status: 'error',
        status_code: 500,
        stack_trace: err.stack,
        message: err.message,
        code: err.code
      });
    }

    return this;
  }
  setErrorHandler(fn) {
    this._config._errorHandler = fn;

    return this;
  }
  setNotFoundHandler(fn) {
    this._config._notFoundHandler = fn;

    return this;
  }
  use(...args) {
    this._route.use(...args);

    return this;
  }
  define(callback) {
    callback(this);

    return this;
  }
  publish(topic, string, isBinary, compress) {
    this._app.publish(topic, string, isBinary, compress);
  }
  listen(port, host) {
    const {
      _config: config,
      _app: app,
      _routeCalled,
      _optionsCalled,
      _console
    } = this;

    if (typeof port === 'string') {
      if (port.indexOf('.') !== -1) {
        const _host = host;

        host = port;
        port = _host || undefined;
      }
    }

    if (!_routeCalled) {
      const _errorContext = _console.error ? _console : console;

      _errorContext.error(
        'nanoexpress [Server]: None of middleware will be called until you define route'
      );
    }

    // Polyfill for plugins like CORS
    // Detaching it from every method for performance reason
    if (_routeCalled && !_optionsCalled) {
      this.options('/*', async (req, res) => res.end(''));
    }

    if (!this._anyRouteCalled) {
      const notFoundHandler =
        config._notFoundHandler ||
        (async (req, res) => {
          res.writeStatus('404 Not Found');
          res.end(
            JSON.stringify({ code: 404, message: 'The route does not exist' })
          );
        });
      this.get('/*', notFoundHandler);
    }

    return new Promise((resolve, reject) => {
      if (port === undefined) {
        const _errorContext = _console.error ? _console : console;

        _errorContext.error('[Server]: PORT is required');
        return undefined;
      }
      port = Number(port);

      const onListenHandler = (token) => {
        if (typeof host === 'string') {
          config.host = host;
        } else {
          config.host = 'localhost';
        }
        if (typeof port === 'number') {
          config.port = port;
        }

        if (token) {
          const _debugContext = _console.debug ? _console : console;

          this._instance = token;
          _debugContext.debug(
            `[Server]: started successfully at [${
              config.host
            }:${port}] in [${Date.now() - this.time}ms]`
          );
          resolve(this);
        } else {
          const _errorContext = _console.error ? _console : console;

          _errorContext.error(
            `[Server]: failed to host at [${config.host}:${port}]`
          );
          reject(
            new Error(`[Server]: failed to host at [${config.host}:${port}]`)
          );
          config.host = null;
          config.port = null;
        }
      };

      if (host) {
        app.listen(host, port, onListenHandler);
      } else {
        app.listen(port, onListenHandler);
      }
    });
  }
  close() {
    const { _config: config, _console } = this;

    if (this._instance) {
      const _debugContext = _console.debug ? _console : console;

      config.host = null;
      config.port = null;
      uWS.us_listen_socket_close(this._instance);
      this._instance = null;
      _debugContext.debug('[Server]: stopped successfully');
      return true;
    } else {
      const _errorContext = _console.error ? _console : console;

      _errorContext.error('[Server]: Error, failed while stopping');
      return false;
    }
  }
}

for (let i = 0, len = httpMethods.length; i < len; i++) {
  const method = httpMethods[i];
  App.prototype.ws = function(path, fn, options) {
    this._route.ws(path, fn, options);
    return this;
  };
  App.prototype[method] = function(path, ...fns) {
    const { _app, _route, _anyRouteCalled } = this;

    if (fns.length > 0) {
      const preparedRouteFunction = _route._prepareMethod(
        method.toUpperCase(),
        { path, originalUrl: path },
        ...fns
      );

      _app[method](path, preparedRouteFunction);

      this._routeCalled = true;

      if (!_anyRouteCalled && method !== 'options') {
        this._anyRouteCalled = path === '/*';
      }

      if (method === 'options') {
        this._optionsCalled = true;
      }
    }
    return this;
  };
}
