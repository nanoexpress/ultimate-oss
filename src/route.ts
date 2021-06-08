import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import { invalid, _gc } from './helpers';
import { HttpHandler, HttpMethod, UnpreparedRoute } from './types/find-route';
import { IWebsocketRoute } from './types/nanoexpress';

export default class Route {
  _routers: UnpreparedRoute[];

  _ws: IWebsocketRoute[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _app: any;

  _basePath: string;

  constructor() {
    this._routers = [];
    this._ws = [];
    this._app = null;
    this._basePath = '';

    return this;
  }

  on(
    method: HttpMethod,
    path: string | RegExp,
    ...handlers: HttpHandler<HttpMethod>[]
  ): this {
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;
    if (this._app) {
      this._app.on(method, normalisedPath, ...handlers);
    } else {
      handlers.forEach((handler) => {
        this._routers.push({ method, path: normalisedPath, handler });
      });
    }

    return this;
  }

  use(
    path: string | HttpHandler<HttpMethod>,
    ...middlewares: HttpHandler<HttpMethod>[]
  ): this {
    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = '*';
    }
    middlewares.forEach((handler) => {
      this.on('ANY', path as string, handler);
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

  ws(path: RecognizedString, options?: WebSocketBehavior): this {
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;
    this._ws.push({ path: normalisedPath, options } as IWebsocketRoute);

    return this;
  }

  publish(
    topic: RecognizedString,
    message: RecognizedString,
    isBinary?: boolean,
    compress?: boolean
  ): boolean {
    if (this._app) {
      return this._app.publish(topic, message, isBinary, compress);
    }
    invalid(
      'nanoexpress [Router]: Please attach to `Application` before using publish'
    );
    return false;
  }
}
