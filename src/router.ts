/* eslint-disable max-lines, max-lines-per-function */
import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import {
  MiddlewareHandler,
  RequestSchema,
  RequestSchemaWithBody,
  RouteHandler,
  UnpreparedRoute
} from '../types/find-route';
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

  on<T>(
    method: HttpMethod,
    path: string | RegExp,
    handlers:
      | MiddlewareHandler
      | MiddlewareHandler[]
      | RouteHandler<HttpMethod, T>
      | RouteHandler<HttpMethod, T>[],
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
    path: string | MiddlewareHandler | Router,
    ...middlewares: Array<MiddlewareHandler | Router>
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
    middlewares.forEach((handler: Router | MiddlewareHandler) => {
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
        this.use(path, ...handler);
      } else {
        this.on(
          'ANY',
          '*',
          handler,
          path as string,
          this._basePath + (path as string)
        );
      }
    });

    _gc();

    return this;
  }

  get<T = RequestSchema>(
    path: string | RegExp,
    ...handlers: RouteHandler<'GET', T>[]
  ): this {
    return this.on(
      'GET',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
      this._basePath,
      ''
    );
  }

  post<T = RequestSchemaWithBody>(
    path: string | RegExp,
    ...handlers: RouteHandler<'POST', T>[]
  ): this {
    return this.on(
      'POST',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
      this._basePath,
      ''
    );
  }

  put<T = RequestSchemaWithBody>(
    path: string | RegExp,
    ...handlers: RouteHandler<'PUT', T>[]
  ): this {
    return this.on(
      'PUT',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
      this._basePath,
      ''
    );
  }

  options<T = RequestSchema>(
    path: string | RegExp,
    ...handlers: RouteHandler<'OPTIONS', T>[]
  ): this {
    return this.on(
      'OPTIONS',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
      this._basePath,
      ''
    );
  }

  del<T = RequestSchema>(
    path: string | RegExp,
    ...handlers: RouteHandler<'DEL', T>[]
  ): this {
    return this.on(
      'DEL',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
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
  delete<T = RequestSchema>(
    path: string | RegExp,
    ...handlers: RouteHandler<'DEL', T>[]
  ): this {
    return this.del(path, ...handlers);
  }

  /**
   * @param path The accessible path to be called route handler
   * @param handlers List of middlewares and/or routes
   * @returns Router
   */
  all<T = RequestSchemaWithBody>(
    path: string | RegExp,
    ...handlers: RouteHandler<'ANY', T>[]
  ): this {
    return this.on(
      'ANY',
      path,
      handlers as RouteHandler<HttpMethod, T>[],
      this._basePath,
      ''
    );
  }

  ws(path: RecognizedString, options?: WebSocketBehavior): this {
    const normalisedPath =
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
