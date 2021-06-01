/* eslint-disable max-lines */
import fastDecodeURI from 'fast-decode-uri-component';
import { pathToRegexp } from 'path-to-regexp';
import {
  HttpHandler,
  HttpMethod,
  PreparedRoute,
  UnpreparedRoute
} from './typings/find-route';
import { HttpRequestExtended } from './typings/nanoexpress';
import { _gc } from './helpers';
import invalid from './helpers/invalid';
import { HttpResponse } from './polyfills';

export default class FindRoute {
  protected options;

  protected routes: PreparedRoute[];

  public async: boolean;

  public await: boolean;

  public fetchParams: boolean;

  protected defaultRoute: HttpHandler | null;

  constructor(options = {}) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
    this.fetchParams = true;
    this.defaultRoute = null;
  }

  setNotFoundHandler(handler: HttpHandler): this {
    this.defaultRoute = handler;

    return this;
  }

  // eslint-disable-next-line class-methods-use-this, max-lines-per-function
  parse(incomingRoute: UnpreparedRoute): PreparedRoute {
    const route: PreparedRoute = {
      ...incomingRoute,
      all: true,
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
        route.params_id = [];
        route.path = pathToRegexp(route.path, route.params_id);
        route.regex = true;
      } else if (route.path.indexOf('*') !== -1) {
        route.params_id = [];
        route.path = pathToRegexp(route.path, route.params_id);
        route.fetch_params = route.params_id.length > 0;
        route.regex = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.handler.toString().includes('await');
    route.legacy = route.handler.toString().includes('next(');

    if (route.legacy) {
      invalid(
        'nanoexpress: pro-slim does not allow any legacy middlewares, if you need to use lagacy Express.js middlewares, please use `utils/legacy`'
      );
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
    path: string | string[],
    handler: HttpHandler | HttpHandler[]
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

    _gc();

    return this;
  }

  off(method: HttpMethod, path: string, handler: HttpHandler): this {
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
    param: Record<keyof PreparedRoute, PreparedRoute[keyof PreparedRoute]>
  ): PreparedRoute[] {
    const { routes } = this;

    return routes.filter((route) =>
      Object.keys(param).every(
        (key: string): boolean =>
          (param as unknown as PreparedRoute)[key as keyof PreparedRoute] ===
          (route as unknown as PreparedRoute)[key as keyof PreparedRoute]
      )
    );
  }

  find(
    method: HttpMethod,
    path: string,
    handlers: HttpHandler[] = []
  ): HttpHandler[] {
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
    req: HttpRequestExtended,
    res: HttpResponse
  ): Promise<HttpResponse | void> {
    const { routes } = this;
    let response;

    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      if (route.method === 'ANY' || route.method === req.method) {
        let found = false;
        if (route.all) {
          found = true;
        } else if (route.path === req.path) {
          found = true;
        } else if (route.regex && (route.path as RegExp).test(req.path)) {
          found = true;
        }

        if (found) {
          if (route.fetch_params && route.params_id) {
            const exec = (route.path as RegExp).exec(req.path);
            req.params = {} as Record<string, string>;

            for (
              let p = 0, lenp = route.params_id.length;
              exec && p < lenp;
              p += 1
            ) {
              const key = route.params_id[p] as unknown as string;
              const value = exec[p + 1];

              req.params[key] = value;
            }
          }
          if (route.async || route.legacy) {
            // eslint-disable-next-line no-await-in-loop
            response = await route.handler(req, res);
          } else {
            response = route.handler(req, res);
          }

          if (response !== undefined && response !== res) {
            return res.end(JSON.stringify(response));
          }
          if (response === res) {
            return res;
          }
        }
      }
    }

    if (response === undefined && this.defaultRoute !== null) {
      return this.defaultRoute(req, res);
    }

    return response;
  }
}
