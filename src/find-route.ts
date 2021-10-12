/* eslint-disable max-lines */
import fastDecodeURI from 'fast-decode-uri-component';
import { pathToRegexp } from 'path-to-regexp';
import {
  HttpHandler,
  HttpMethod,
  HttpRequestExtended,
  PreparedRoute,
  UnpreparedRoute
} from '../types/find-route';
import { debug, _gc } from './helpers';
import { HttpResponse } from './polyfills';
import legacyUtil from './utils/legacy';

export default class FindRoute {
  protected options;

  protected routes: PreparedRoute[];

  public async: boolean;

  public await: boolean;

  public fetchParams: boolean;

  protected defaultRoute: HttpHandler<HttpMethod> | null;

  protected errorRoute:
    | ((
        err: Error,
        req: HttpRequestExtended<HttpMethod>,
        res: HttpResponse
      ) => void)
    | null;

  constructor(options = {}) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
    this.fetchParams = false;
    this.defaultRoute = null;
    this.errorRoute = null;
  }

  setNotFoundHandler(handler: HttpHandler<HttpMethod>): this {
    this.defaultRoute = handler;

    return this;
  }

  setErrorHandler(
    handler: (
      err: Error,
      req: HttpRequestExtended<HttpMethod>,
      res: HttpResponse
    ) => void
  ): this {
    this.errorRoute = handler;

    return this;
  }

  handleError(
    error: Error,
    req: HttpRequestExtended<HttpMethod>,
    res: HttpResponse
  ): this {
    if (this.errorRoute) {
      this.errorRoute(error, req, res);
    }
    return this;
  }

  // eslint-disable-next-line class-methods-use-this, max-lines-per-function, complexity
  parse(incomingRoute: UnpreparedRoute): PreparedRoute {
    const route: PreparedRoute = {
      ...incomingRoute,
      originalPath:
        incomingRoute.path instanceof RegExp ? null : incomingRoute.path,
      all: false,
      regex: false,
      fetch_params: false,
      async: false,
      await: false,
      legacy: false
    };

    if (typeof route.path === 'string') {
      route.path = fastDecodeURI(route.path);
      if (route.path === '*' || route.path === '/*') {
        route.all = true;
      } else if (route.path.indexOf(':') !== -1) {
        route.fetch_params = true;
        route.param_keys = [];
        route.originalPath = route.path;
        route.path = pathToRegexp(route.path, route.param_keys);
        route.regex = true;
      } else if (route.method === ('*' as HttpMethod)) {
        route.originalPath = route.path;
        route.all = true;
      } else if (route.path.indexOf('/*') !== -1) {
        route.originalPath = route.path;
        route.path = route.path.substr(0, route.path.indexOf('/*'));
        route.all = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
      route.originalPath = null;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.handler.toString().includes('await');
    route.legacy = route.handler.toString().includes('next(');

    if (route.legacy) {
      route.handler = legacyUtil(route.handler);
    }

    if (!this.fetchParams && route.fetch_params) {
      this.fetchParams = true;
    }
    if (!this.async && route.async) {
      this.async = true;
    }
    if (!this.await && route.await) {
      this.await = true;
    }
    return route;
  }

  on(
    method: HttpMethod,
    path: string | RegExp | Array<string | RegExp>,
    handler: HttpHandler<HttpMethod> | HttpHandler<HttpMethod>[]
  ): this {
    if (Array.isArray(method)) {
      method.forEach((methodId) => {
        this.on(methodId, path, handler);
      });
      return this;
    }
    if (Array.isArray(path)) {
      path.forEach((pathId) => {
        this.on(method, pathId, handler);
      });
      return this;
    }
    if (Array.isArray(handler)) {
      handler.forEach((handlerId) => {
        this.on(method, path, handlerId);
      });
      return this;
    }

    this.routes.push(this.parse({ method, path, handler }));

    debug(
      'new route registered [%s] %s',
      method === ('*' as HttpMethod) ? 'middleware' : method,
      path
    );
    _gc();

    return this;
  }

  apply(
    path: string | RegExp | Array<string | RegExp>,
    handler: HttpHandler<HttpMethod> | HttpHandler<HttpMethod>[]
  ): this {
    return this.on('*' as HttpMethod, path, handler);
  }

  off(
    method: HttpMethod,
    path: string,
    handler: HttpHandler<HttpMethod>
  ): this {
    const parsed = this.parse({ method, path, handler });

    if (!handler) {
      this.routes = this.routes.filter(
        (route) =>
          !(route.method === parsed.method && route.path === parsed.path)
      );
    } else {
      this.routes = this.routes.filter(
        (route) =>
          !(
            route.method === parsed.method &&
            route.path === parsed.path &&
            route.handler === parsed.handler
          )
      );
    }

    _gc();

    return this;
  }

  search(
    param?: Record<keyof PreparedRoute, PreparedRoute[keyof PreparedRoute]>
  ): PreparedRoute[] {
    const { routes } = this;

    return param
      ? routes.filter((route) =>
          Object.keys(param).every(
            (key: string): boolean =>
              (param as unknown as PreparedRoute)[
                key as keyof PreparedRoute
              ] ===
              (route as unknown as PreparedRoute)[key as keyof PreparedRoute]
          )
        )
      : routes;
  }

  find(
    method: HttpMethod,
    path: string,
    handlers: HttpHandler<HttpMethod>[] = []
  ): HttpHandler<HttpMethod>[] {
    const { routes } = this;

    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      if (route.method === method) {
        if (route.regex && (route.path as RegExp).test(path)) {
          handlers.push(route.handler);
        } else if (route.path === path) {
          handlers.push(route.handler);
        }
      }
    }

    _gc();

    return handlers;
  }

  // eslint-disable-next-line max-lines-per-function, complexity
  async lookup(
    req: HttpRequestExtended<HttpMethod>,
    res: HttpResponse
  ): Promise<HttpResponse | string | void> {
    const { routes } = this;
    let response;

    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      // Early return for performance reason
      if (res.done) {
        return res;
      }

      if (
        route.method === 'ANY' ||
        route.method === ('*' as HttpMethod) ||
        route.method === req.method
      ) {
        let found = false;
        if (route.all) {
          found = route.path ? req.path.includes(route.path as string) : true;
        } else if (route.path === req.path) {
          found = true;
        } else if (route.regex && (route.path as RegExp).test(req.path)) {
          found = true;
        }

        if (found) {
          debug('routes lookup route found [%o]', route);
          if (route.fetch_params && route.param_keys) {
            const exec = (route.path as RegExp).exec(req.path);

            for (
              let p = 0, lenp = route.param_keys.length;
              exec && p < lenp;
              p += 1
            ) {
              const key = route.param_keys[p].name;
              const value = exec[p + 1];

              (req.params as Record<string, string>)[key] = value;
            }
          }
          if (route.async || route.legacy) {
            // eslint-disable-next-line no-await-in-loop
            response = await route.handler(req, res);
          } else {
            response = route.handler(req, res);
          }

          if (res.done || response === res) {
            return res;
          }
          if (!res.done && response) {
            return res.send(response as string | Record<string, unknown>);
          }
        }
      }
    }

    if (response === undefined && this.defaultRoute !== null) {
      const notFound = this.defaultRoute(req, res);

      if (notFound !== res) {
        return res.send(notFound as string | Record<string, unknown>);
      }

      return notFound;
    }
  }
}
