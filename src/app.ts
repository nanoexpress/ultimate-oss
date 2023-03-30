/* eslint-disable max-lines, max-lines-per-function, complexity, max-depth */
import { resAbortHandler } from './constants';
import uWS, {
  HttpRequest as uWS_HttpRequest,
  HttpResponse as uWS_HttpResponse,
  RecognizedString,
  TemplatedApp,
  us_listen_socket,
  WebSocketBehavior
} from 'uWebSockets.js';
import { HttpHandler, RequestSchema } from '../types/find-route';
import {
  HttpMethod,
  INanoexpressOptions,
  IWebsocketRoute
} from '../types/nanoexpress';
import _gc from './helpers/gc';
import { debug, warn } from './helpers/loggy';
import { unregister } from './hooks/manager';
import { HttpRequest, HttpResponse } from './polyfills';
import RouteEngine from './route-engine';
import RouterTemplate from './router';
import noop from './helpers/noop';

class App extends RouterTemplate {
  get https(): boolean {
    return this._options.https !== undefined;
  }

  get _console(): Console {
    return this._options.console || console;
  }

  get raw(): TemplatedApp {
    return this._app;
  }

  protected _app: TemplatedApp;

  protected _options: INanoexpressOptions;

  protected _engine: RouteEngine;

  protected _ws: IWebsocketRoute[];

  protected _requestPools: HttpRequest[];

  protected _responsePools: HttpResponse[];

  protected _poolsSize: number;

  protected time: [number, number];

  protected _separateServed: boolean;

  protected _ran: boolean;

  protected _instance: Record<string, us_listen_socket | null>;

  protected defaultRoute: HttpHandler<HttpMethod, any> | null;

  protected errorRoute:
    | ((err: Error, req: HttpRequest, res: HttpResponse) => void)
    | null;

  constructor(options: INanoexpressOptions, app: TemplatedApp) {
    super();
    this._options = options;
    this._app = app;
    this._engine = new RouteEngine(options);

    this.defaultRoute = (_, res): HttpResponse => {
      return res.status(404).send({ status: 'error', code: 404 });
    };
    this.errorRoute = (err, _, res): HttpResponse => {
      return res.status(500).send({
        status: 'error',
        message: err.message
      });
    };

    this._ws = [];
    this._requestPools = [];
    this._responsePools = [];
    this._poolsSize = options.poolSize || 10;

    this.time = process.hrtime();
    this._separateServed = false;
    this._ran = false;

    this._instance = {};
    return this;
  }

  setNotFoundHandler(handler: HttpHandler<HttpMethod, RequestSchema>): this {
    this.defaultRoute = handler;

    return this;
  }

  setErrorHandler(
    handler: (err: Error, req: HttpRequest, res: HttpResponse) => void
  ): this {
    this.errorRoute = handler;

    return this;
  }

  handleError(error: Error, req: HttpRequest, res: HttpResponse): this {
    if (res && !res.aborted && !res.done && !res.streaming && this.errorRoute) {
      this.errorRoute(error, req, res);
    }

    return this;
  }

  ws<T>(path: RecognizedString, options: WebSocketBehavior<T>): this {
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
      _options: options,
      _ws,
      _requestPools,
      _responsePools,
      _poolsSize,
      _engine,
      _ran
    } = this;

    if (!_ran) {
      const handler = async (
        rawRes: uWS_HttpResponse,
        rawReq: uWS_HttpRequest
      ): Promise<uWS_HttpResponse | void> => {
        let req: HttpRequest;
        let res: HttpResponse;
        let response;

        if (_requestPools.length > 0) {
          req = _requestPools.shift() as HttpRequest;
          req.setRequest(rawReq, rawRes);
        } else {
          req = new HttpRequest(options);
          req.setRequest(rawReq, rawRes);
        }
        if (_responsePools.length > 0) {
          res = _responsePools.shift() as HttpResponse;
          res.setResponse(rawRes, req);
        } else {
          res = new HttpResponse(options);
          res.setResponse(rawRes, req);
        }

        if (
          options.ignoreTrailingSlash &&
          req.path.charAt(req.path.length - 1) !== '/' &&
          (req.path.lastIndexOf('.') === -1 ||
            req.path.lastIndexOf('.') < req.path.length - 4)
        ) {
          if (options.enableExpressCompatibility) {
            debug(
              'res.redirect called instead of fast quick-fix on route ending without "/" for express.js middlewares compatibility'
            );
            res.redirect(`http://${req.headers.host}${req.originalUrl}/`);
            return rawRes;
          }
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          res.exposeAborted();

          rawRes.onData((arrayChunk: ArrayBuffer, isLast: boolean) => {
            req.stream.push(Buffer.from(arrayChunk.slice(0)));

            if (isLast) {
              req.stream.push(null);
            }
          });
        }

        if (res.aborted || res.done || req.method === 'OPTIONS') {
          debug('early returned ranning %o', {
            aborted: res.aborted,
            done: res.done,
            method: req.method
          });
          return;
        }

        if (_engine.async && _engine.await) {
          res.exposeAborted();
          response = await _engine.lookup(req, res).catch((err) => {
            this.handleError(err, req, res as HttpResponse);
          });
          if (res[resAbortHandler]) {
            res.onAborted(unregister);
          } else {
            unregister();
          }
          if (_requestPools.length < _poolsSize) {
            _requestPools.push(req);
          }
          if (_responsePools.length < _poolsSize) {
            _responsePools.push(res);
          }
          return rawRes;
        }

        await _engine.lookup(req, res).catch((err) => {
          this.handleError(err, req, res as HttpResponse);
        });
        if (res[resAbortHandler]) {
          res.onAborted(unregister);
        } else {
          unregister();
        }
        if (_requestPools.length < _poolsSize) {
          _requestPools.push(req);
        }
        if (_responsePools.length < _poolsSize) {
          _responsePools.push(res);
        }

        if (
          res &&
          !res.done &&
          !res.streaming &&
          response === undefined &&
          this.defaultRoute !== null
        ) {
          debug('routes lookup was not found any route, fallback to not-found');
          const notFound = await this.defaultRoute(req, res);

          if (notFound !== res) {
            res.send(notFound as string | Record<string, unknown>);
          }
        }
        return rawRes;
      };

      app.any('/*', handler);

      _ws.forEach(({ path, options: wsOptions }) => {
        app.ws(path, wsOptions);
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
    is_ssl = false,
    handler: () => void = noop
  ): Promise<us_listen_socket> {
    const { _options: options } = this;

    if (
      (port === 80 || port === 443) &&
      this.https &&
      options.https?.separateServer &&
      !this._separateServed
    ) {
      const httpsPort =
        typeof options.https.separateServer === 'number'
          ? options.https.separateServer
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
    handler: () => void = noop
  ): Promise<us_listen_socket> {
    const { _console, _options: options, _app: app } = this;
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
            ).toFixed(2)}ms] on PID[${process.pid}]`
          );
          _gc();
          handler();
          return resolve(token);
        }
        const _errorContext = 'error' in _console ? _console : console;

        const err = new Error(
          this.https &&
          (!options.https ||
            !options.https.cert_file_name ||
            !options.https.key_file_name)
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
    warn(
      `[Server]: The tag [${tag}] cannot be disabled as not set, not supported and not available`
    );
    return this;
  }

  /**
   * @deprecated Please use configuration at initialization such as `nanoexpress({json_spaces:2})` insteadof `app.set('json_spaces', 2)`
   */
  set(key: keyof INanoexpressOptions, value: string | number): this {
    // @ts-ignore
    this._options[key] = value;
    return this;
  }
}

export default App;
