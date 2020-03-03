import exposeApp from './expose/App.js';

export default exposeApp(
  class App {
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
      this._routeCalled = true;

      return this;
    }
    define(callback) {
      callback(this);

      return this;
    }
    listen(port, host = 'localhost', is_ssl) {
      const { _config: config } = this;

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

      this._prepareListen();

      return this._applyListen(host, port, is_ssl);
    }
    close(port, host = 'localhost') {
      const id = `${host}:${port}`;
      const token = this._instance[id];

      this.time = null;
      this._separateServed = false;

      this._close(token, id);
    }
  }
);
