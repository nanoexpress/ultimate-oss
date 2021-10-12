/* eslint-disable complexity, max-lines, max-lines-per-function */
import uWS, {
  HttpRequest as uWS_HttpRequest,
  HttpResponse as uWS_HttpResponse,
  RecognizedString,
  TemplatedApp,
  us_listen_socket,
  WebSocketBehavior
} from 'uWebSockets.js';
import {
  HttpHandler,
  HttpMethod,
  HttpRequestExtended
} from '../types/find-route';
import {
  HttpRequest,
  INanoexpressOptions,
  IWebsocketRoute
} from '../types/nanoexpress';
import { appInstance, routerInstances, wsInstances } from './constants';
import FindRoute from './find-route';
import _gc from './helpers/gc';
import { debug } from './helpers/loggy';
import { HttpResponse } from './polyfills';
import Router from './router';

class App {
  get config(): INanoexpressOptions {
    return this._config;
  }

  get https(): boolean {
    return this._config.https !== undefined && this._config.isSSL !== false;
  }

  get _console(): Console {
    return this._config.console || console;
  }

  get raw(): TemplatedApp {
    return this._app;
  }

  protected _config: INanoexpressOptions;

  protected _app: TemplatedApp;

  protected _router: FindRoute;

  protected _ws: IWebsocketRoute[];

  protected _pools: HttpResponse[];

  protected _poolsSize: number;

  protected time: [number, number];

  protected _separateServed: boolean;

  protected _ran: boolean;

  protected _instance: Record<string, us_listen_socket | null>;

  constructor(config: INanoexpressOptions, app: TemplatedApp) {
    this._config = config;
    this._app = app;
    this._router = new FindRoute(config);

    this._ws = [];
    this._pools = [];
    this._poolsSize = config?.poolSize || 10;

    this.time = process.hrtime();
    this._separateServed = false;
    this._ran = false;

    this._instance = {};

    return this;
  }

  setNotFoundHandler(handler: HttpHandler<HttpMethod>): this {
    this._router.setNotFoundHandler(handler);

    return this;
  }

  setErrorHandler(
    handler: (
      err: Error,
      req: HttpRequestExtended<HttpMethod>,
      res: HttpResponse
    ) => void
  ): this {
    this._router.setErrorHandler(handler);

    return this;
  }

  use(
    basePath: string | HttpHandler<HttpMethod>,
    ...middlewares: Array<HttpHandler<HttpMethod> | Router>
  ): this {
    if (typeof basePath === 'function') {
      middlewares.unshift(basePath);
      basePath = '*';
    }
    middlewares.forEach((handler: Router | HttpHandler<HttpMethod>) => {
      if (handler instanceof Router) {
        const _routers = handler[routerInstances];
        const _ws = handler[wsInstances];

        handler[appInstance] = this;
        handler._basePath = basePath as string;

        _routers.forEach(({ method, path, handler: routeHandler }) => {
          handler.on(method, path, routeHandler);
        });
        this._ws.push(..._ws);

        _routers.length = 0;
        _ws.length = 0;
      } else {
        this._router.apply(basePath as string, handler);
      }
    });

    return this;
  }

  on(
    method: HttpMethod,
    path: string | RegExp,
    ...handlers: HttpHandler<HttpMethod>[]
  ): this {
    handlers.forEach((handler) => {
      this._router.on(method.toUpperCase() as HttpMethod, path, handler);
    });
    _gc();
    return this;
  }

  get(path: string | RegExp, ...handlers: HttpHandler<'GET'>[]): this {
    return this.on('GET', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  post(path: string | RegExp, ...handlers: HttpHandler<'POST'>[]): this {
    return this.on('POST', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  put(path: string | RegExp, ...handlers: HttpHandler<'PUT'>[]): this {
    return this.on('PUT', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  options(path: string | RegExp, ...handlers: HttpHandler<'OPTIONS'>[]): this {
    return this.on('OPTIONS', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  del(path: string | RegExp, ...handlers: HttpHandler<'DEL'>[]): this {
    return this.on('DEL', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  /**
   *
   * @param path
   * @param handlers
   * @alias app.del
   * @returns App
   */
  delete(path: string | RegExp, ...handlers: HttpHandler<'DEL'>[]): this {
    return this.del(path, ...handlers);
  }

  /**
   * @param path The accessible path to be called route handler
   * @param handlers List of middlewares and/or routes
   * @returns App
   */
  all(path: string | RegExp, ...handlers: HttpHandler<'ANY'>[]): this {
    return this.on('ANY', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  ws(path: RecognizedString, options: WebSocketBehavior): this {
    this._app.ws(path, options);

    return this;
  }

  publish(
    topic: RecognizedString,
    message: RecognizedString,
    isBinary?: boolean,
    compress?: boolean
  ): boolean {
    return this._app.publish(topic, message, isBinary, compress);
  }

  run(): this {
    const {
      _app: app,
      _config: config,
      _ws,
      _pools,
      _poolsSize,
      _router: router,
      _ran
    } = this;

    if (!_ran) {
      for (const route of router.search()) {
        if (route.regex && !route.originalPath) {
          continue; // TO-DO: handle later
        }

        const keys =
          route.fetch_params && route.param_keys
            ? route.param_keys.map((param) => param.name)
            : [];
        const isBody = route.method === 'POST' || route.method === 'PUT';
        const isAny = route.method === 'ANY';
        const isSuball = route.method === ('*' as HttpMethod);

        const fetchUrl = isAny || route.fetch_params;
        const originalPath = route.originalPath as string;
        const registerPath = originalPath.endsWith('/')
          ? originalPath.substr(0, originalPath.length - 1)
          : originalPath;
        const method = isSuball
          ? null
          : (route.method.toLowerCase() as Lowercase<HttpMethod>);

        const handler = async (
          rawRes: uWS_HttpResponse,
          rawReq: uWS_HttpRequest
        ): Promise<uWS_HttpResponse | void> => {
          let res: HttpResponse | undefined;
          const req = rawReq as HttpRequest;
          req.url =
            fetchUrl || isSuball ? req.getUrl() : (route.path as string);

          req.path = req.url;
          req.method =
            isAny || isSuball
              ? (req.getMethod().toUpperCase() as HttpMethod)
              : route.method;

          req.headers = {};

          if (isBody) {
            // get body or create transform here
          }

          if (_pools.length > 0) {
            res = _pools.shift() as HttpResponse;
            res.setResponse(rawRes, req);
          } else {
            res = new HttpResponse(config);
            res.setResponse(rawRes, req);
          }

          if (res.aborted || res.done || req.method === 'OPTIONS') {
            debug('early returned ranning %o', {
              aborted: res.aborted,
              done: res.done,
              method: req.method
            });
            return;
          }

          if (route.fetch_params) {
            req.params = {};
            for (let i = 0, len = keys.length; i < len; i += 1) {
              (req.params as Record<string, string>)[keys[i]] =
                req.getParameter(i);
            }
          }

          if (route.legacy || (router.async && router.await)) {
            res.exposeAborted();
            await router.lookup(req, res).catch((err) => {
              this._router.handleError(err, req, res as HttpResponse);
            });
            if (_pools.length < _poolsSize) {
              _pools.push(res);
            }
            return rawRes;
          }

          router.lookup(req, res);
          if (_pools.length < _poolsSize) {
            _pools.push(res);
          }
        };

        if (isSuball) {
          app.any(registerPath, handler);
          app.any(`${registerPath}/*`, handler);
        } else if (method && config.ignoreTrailingSlash) {
          app[method](registerPath, handler);
          app[method](`${registerPath}/`, handler);
        } else if (method) {
          app[method](originalPath, handler);
        }
      }

      _ws.forEach(({ path, options }) => {
        this._app.ws(path, options);
      });
      // Cleanup GC
      _ws.length = 0;
      _gc();

      this._ran = true;
    }

    return this;
  }

  listenSocket(
    port: number,
    host = 'localhost',
    is_ssl: boolean,
    handler: () => void
  ): Promise<us_listen_socket> {
    const { _config: config } = this;

    if (
      (port === 80 || port === 443) &&
      this.https &&
      config.https?.separateServer &&
      !this._separateServed
    ) {
      const httpsPort =
        typeof config.https.separateServer === 'number'
          ? config.https.separateServer
          : 443;
      this._separateServed = true;
      return Promise.all([
        this.listenSocket(port, host, false, handler),
        this.listenSocket(httpsPort, host, true, handler)
      ]);
    }

    return this._appApplyListen(host, port, is_ssl, handler);
  }

  listen(
    ...args: Array<number | string | boolean | (() => void)>
  ): Promise<us_listen_socket> {
    let port = 8000;
    let host = 'localhost';
    let ssl = false;
    let handler: () => void = () => {};

    args.forEach((listenArg): void => {
      if (typeof +listenArg === 'number' && !Number.isNaN(+listenArg)) {
        port = +listenArg;
      } else if (typeof listenArg === 'function') {
        handler = listenArg;
      } else if (
        typeof listenArg === 'string' &&
        (listenArg === 'localhost' || listenArg.includes('.'))
      ) {
        host = listenArg;
      } else if (listenArg === true) {
        ssl = true;
      }
    });
    this.run();
    return this.listenSocket(port, host, ssl, handler);
  }

  close(port: number, host = 'localhost'): boolean {
    const id = `${host}:${port}`;
    const token = this._instance[id];

    this._separateServed = false;
    this.time[0] = 0;
    this.time[1] = 0;

    return this._close(token, id);
  }

  protected _appApplyListen(
    host: string,
    port: number,
    is_ssl = false,
    handler: () => void
  ): Promise<us_listen_socket> {
    const { _console, _config: config, _app: app } = this;

    // eslint-disable-next-line no-nested-ternary
    const sslString = is_ssl ? 'HTTPS ' : is_ssl === false ? 'HTTP ' : '';

    return new Promise((resolve, reject): void => {
      if (port === undefined) {
        const _errorContext = 'error' in _console ? _console : console;

        _errorContext.error('[Server]: PORT is required');
        return undefined;
      }
      const id = `${host}:${port}`;

      const onListenHandler = (token: us_listen_socket): void => {
        if (token) {
          const _debugContext = 'debug' in _console ? _console : console;
          const end = process.hrtime(this.time);

          this._instance[id] = token;
          _debugContext.debug(
            `[${sslString}Server]: started successfully at [${id}] in [${(
              (Number(end[0]) * 1000 + Number(end[1])) /
              1000000
            ).toFixed(2)}ms]`
          );
          _gc();
          handler();
          return resolve(token);
        }
        const _errorContext = 'error' in _console ? _console : console;

        const err = new Error(
          this.https &&
          (!config.https ||
            !config.https.cert_file_name ||
            !config.https.key_file_name)
            ? `[${sslString}Server]: SSL certificate was not defined or loaded`
            : `[${sslString}Server]: failed to host at [${id}]`
        );
        _errorContext.error(err.message);
        _gc();
        return reject(err);
      };

      if (host && host !== 'localhost') {
        app.listen(host, port, onListenHandler);
      } else {
        app.listen(port, onListenHandler);
      }
    });
  }

  _close(token: us_listen_socket | null, id: string): boolean {
    const { _console } = this;

    if (token) {
      const _debugContext = 'debug' in _console ? _console : console;

      uWS.us_listen_socket_close(token);
      this._instance[id] = null;
      _debugContext.debug('[Server]: stopped successfully');
      _gc();

      return true;
    }

    const _errorContext = 'error' in _console ? _console : console;

    _errorContext.error('[Server]: Error, failed while stopping');
    _gc();

    return false;
  }

  /**
   * @deprecated There no way to disable these methods as they are not available by default
   */
  disable(tag: string): this {
    console.warn(
      `[Server]: The tag [${tag}] cannot be disabled as not set, not supported and not available`
    );
    return this;
  }

  /**
   * @deprecated Please use configuration at initialization such as `nanoexpress({json_spaces:2})` insteadof `app.set('json_spaces', 2)`
   */
  set(key: keyof INanoexpressOptions, value: string | number): this {
    // @ts-ignore
    this.config[key] = value;
    return this;
  }
}

export default App;
