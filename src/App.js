import uWS from 'uWebSockets.js';

import { httpMethods } from './constants.js';

export default class App {
  get config() {
    return this._config;
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

    this.time = process.hrtime();

    this._instance = {};

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
  listen(port, host = 'localhost', is_ssl) {
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
    if (Array.isArray(port)) {
      return Promise.all(
        port.map((currPort, index) => {
          const currHost =
            typeof currPort === 'object'
              ? currPort.host
              : Array.isArray(host)
              ? host[index]
              : host;

          return this.listen(
            typeof currPort === 'object' ? currPort.port : currPort,
            currHost
          );
        })
      );
    } else if (
      this.https &&
      config.https.separateServer &&
      !this._separateServed
    ) {
      const httpsPort =
        typeof config.https.separateServer === 'number'
          ? config.https.separateServer
          : 443;
      this._separateServed = true;
      return Promise.all([
        this.listen(port || 80, host, false),
        this.listen(httpsPort, host, true)
      ]);
    }

    if (!_routeCalled) {
      const _errorContext = _console.error ? _console : console;

      _errorContext.error(
        'nanoexpress [Server]: None of middleware will be called until you define route'
      );
    }

    // Polyfill for plugins like CORS
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
    const sslString = is_ssl ? 'HTTPS ' : is_ssl === false ? 'HTTP ' : '';

    return new Promise((resolve, reject) => {
      if (port === undefined) {
        const _errorContext = _console.error ? _console : console;

        _errorContext.error('[Server]: PORT is required');
        return undefined;
      }
      port = Number(port);

      const onListenHandler = (token) => {
        if (token) {
          const _debugContext = _console.debug ? _console : console;
          const end = process.hrtime(this.time);

          this._instance[`${host}:${port}`] = token;
          _debugContext.debug(
            `[${sslString}Server]: started successfully at [${host}:${port}] in [${(
              (end[0] * 1000 + end[1]) /
              1000000
            ).toFixed(2)}ms]`
          );
          resolve(token);
        } else {
          const _errorContext = _console.error ? _console : console;

          const err = new Error(
            this.https &&
            (!config.https.cert_file_name || !config.https.key_file_name)
              ? `[${sslString}Server]: SSL certificate was not defined or loaded`
              : `[${sslString}Server]: failed to host at [${host}:${port}]`
          );
          _errorContext.error(err.message);
          reject(err);
        }
      };

      if (host) {
        app.listen(host, port, onListenHandler);
      } else {
        app.listen(port, onListenHandler);
      }
    });
  }
  close(port, host = 'localhost') {
    const { _console } = this;

    const token = this._instance[`${host}:${port}`];

    this.time = null;
    this._separateServed = false;
    if (token) {
      const _debugContext = _console.debug ? _console : console;

      uWS.us_listen_socket_close(token);
      this._instance[`${host}:${port}`] = null;
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
  App.prototype.publish = function(topic, string, isBinary, compress) {
    this._route.publish(topic, string, isBinary, compress);
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
