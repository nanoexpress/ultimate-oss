/* eslint-disable  @typescript-eslint/no-explicit-any, max-lines, import/no-cycle, max-lines-per-function */

import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import { HttpHandler, UnpreparedRoute } from '../types/find-route';
import { HttpMethod, IWebsocketRoute } from '../types/nanoexpress';
import App from './app';
import { appInstance, routerInstances, wsInstances } from './constants';
import { invalid, _gc } from './helpers';
import RouteEngine from './route-engine';

export default class Router {
  protected [appInstance]: App | Router;

  protected _engine?: RouteEngine;

  [routerInstances]: UnpreparedRoute[];

  [wsInstances]: IWebsocketRoute[];

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
    handlers: HttpHandler<HttpMethod> | HttpHandler<HttpMethod>[],
    baseUrl: string,
    originalUrl: string
  ): this {
    const { _engine } = this;

    if (_engine) {
      _engine.on(method, path, handlers, baseUrl, originalUrl);
    } else if (Array.isArray(handlers)) {
      handlers.forEach((handler) => {
        this[routerInstances].push({
          method,
          path,
          baseUrl,
          handler,
          originalUrl
        });
      });
    } else {
      this[routerInstances].push({
        method,
        path,
        baseUrl,
        handler: handlers,
        originalUrl
      });
    }

    return this;
  }

  use(
    path: string | HttpHandler<HttpMethod> | Router,
    ...middlewares: Array<HttpHandler<HttpMethod> | Router>
  ): this {
    if (typeof path === 'function' || path instanceof Router) {
      middlewares.unshift(path);
      path = '*';
    }
    if (Array.isArray(path)) {
      if (
        path.every(
          (routePath) =>
            typeof routePath === 'function' || path instanceof Router
        )
      ) {
        return this.use('*', ...path);
      }
    }
    middlewares.forEach((handler: Router | HttpHandler<HttpMethod>) => {
      if (handler instanceof Router) {
        const _routers = handler[routerInstances];
        const _ws = handler[wsInstances];

        handler[appInstance] = this;
        handler._basePath = path as string;

        _routers.forEach(
          ({ method, path: routePath, handler: routeHandler, baseUrl }) => {
            this.on(
              method,
              routePath as string,
              routeHandler,
              path as string,
              (path as string) + baseUrl + (routePath as string)
            );
          }
        );
        this[wsInstances].push(..._ws);

        _routers.length = 0;
        _ws.length = 0;
      } else if (Array.isArray(handler)) {
        this.use(path, handler);
      } else {
        this.on(
          'ANY',
          path as string,
          handler,
          this._basePath,
          this._basePath + (path as string)
        );
      }
    });

    _gc();

    return this;
  }

  get(path: string | RegExp, ...handlers: HttpHandler<'GET'>[]): this {
    return this.on(
      'GET',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
  }

  post(path: string | RegExp, ...handlers: HttpHandler<'POST'>[]): this {
    return this.on(
      'POST',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
  }

  put(path: string | RegExp, ...handlers: HttpHandler<'PUT'>[]): this {
    return this.on(
      'PUT',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
  }

  options(path: string | RegExp, ...handlers: HttpHandler<'OPTIONS'>[]): this {
    return this.on(
      'OPTIONS',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
  }

  del(path: string | RegExp, ...handlers: HttpHandler<'DEL'>[]): this {
    return this.on(
      'DEL',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
  }

  /**
   *
   * @param path
   * @param handlers
   * @alias Router.del
   * @returns Router
   */
  delete(path: string | RegExp, ...handlers: HttpHandler<'DEL'>[]): this {
    return this.del(path, ...handlers);
  }

  /**
   * @param path The accessible path to be called route handler
   * @param handlers List of middlewares and/or routes
   * @returns Router
   */
  all(path: string | RegExp, ...handlers: HttpHandler<'ANY'>[]): this {
    return this.on(
      'ANY',
      path,
      handlers as HttpHandler<HttpMethod>[],
      this._basePath,
      ''
    );
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

  /**
   * @deprecated Use `app.publish()` for safety, this method will not work anymore
   * @param topic
   * @param message
   * @param isBinary
   * @param compress
   * @returns Status of publish
   */
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
