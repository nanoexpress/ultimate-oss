import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import { HttpHandler, HttpMethod, UnpreparedRoute } from '../types/find-route';
import { IWebsocketRoute } from '../types/nanoexpress';
import App from './app';
import { appInstance, routerInstances, wsInstances } from './constants';
import { invalid, _gc } from './helpers';

export default class Router {
  [routerInstances]: UnpreparedRoute[];

  [wsInstances]: IWebsocketRoute[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [appInstance]?: App;

  _basePath: string;

  constructor() {
    this[routerInstances] = [];
    this[wsInstances] = [];
    this._basePath = '';

    return this;
  }

  on(
    method: HttpMethod,
    path: string | RegExp,
    ...handlers: HttpHandler<HttpMethod>[]
  ): this {
    const app = this[appInstance];
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;

    if (app) {
      app.on(method, normalisedPath, ...handlers);
    } else {
      handlers.forEach((handler) => {
        this[routerInstances].push({ method, path: normalisedPath, handler });
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
    middlewares.forEach((handler: Router | HttpHandler<HttpMethod>) => {
      if (handler instanceof Router) {
        const _routers = handler[routerInstances];
        const _ws = handler[wsInstances];

        handler._basePath = path as string;
        handler[appInstance] = this[appInstance];

        _routers.forEach(
          ({ method, path: routePath, handler: routeHandler }) => {
            const normalisedPath =
              // eslint-disable-next-line no-nested-ternary
              path === '*'
                ? '*'
                : routePath === '/'
                ? path
                : `${path}${routePath}`;

            this.on(method, normalisedPath as string, routeHandler);
          }
        );
        this[wsInstances].push(..._ws);

        _routers.length = 0;
        _ws.length = 0;
      } else {
        this.on('ANY', path as string | RegExp, handler);
      }
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
   * @param path The accessible path to be called route handler
   * @param handlers List of middlewares and/or routes
   * @returns Router
   */
  all(path: string | RegExp, ...handlers: HttpHandler<'ANY'>[]): this {
    return this.on('ANY', path, ...(handlers as HttpHandler<HttpMethod>[]));
  }

  ws(path: RecognizedString, options?: WebSocketBehavior): this {
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;
    this[wsInstances].push({
      path: normalisedPath,
      options
    } as IWebsocketRoute);

    return this;
  }

  publish(
    topic: RecognizedString,
    message: RecognizedString,
    isBinary?: boolean,
    compress?: boolean
  ): boolean {
    const app = this[appInstance];
    if (app) {
      return app.publish(topic, message, isBinary, compress);
    }
    invalid(
      'nanoexpress [Router]: Please attach to `Application` before using publish'
    );
    return false;
  }
}
