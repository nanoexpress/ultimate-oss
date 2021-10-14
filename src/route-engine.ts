/* eslint-disable max-lines */
import fastDecodeURI from 'fast-decode-uri-component';
import { pathToRegexp } from 'path-to-regexp';
import {
  HttpHandler,
  HttpRequestExtended,
  PreparedRoute,
  UnpreparedRoute
} from '../types/find-route';
import { HttpMethod, INanoexpressOptions } from '../types/nanoexpress';
import { debug, _gc } from './helpers';
import { HttpResponse } from './polyfills';
import legacyUtil from './utils/legacy';

export default class RouteEngine {
  protected options: INanoexpressOptions;

  protected routes: PreparedRoute[];

  public async: boolean;

  public await: boolean;

  public fetchParams: boolean;

  constructor(options: INanoexpressOptions) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
    this.fetchParams = false;
  }

  // eslint-disable-next-line class-methods-use-this, max-lines-per-function, complexity
  parse(incomingRoute: UnpreparedRoute): PreparedRoute {
    const { options: config } = this;

    const route: PreparedRoute = {
      ...incomingRoute,
      all: false,
      regex: false,
      fetch_params: false,
      async: false,
      await: false,
      legacy: false
    };

    if (typeof route.path === 'string') {
      if (
        config.ignoreTrailingSlash &&
        route.path !== '*' &&
        route.path.charAt(route.path.length - 1) !== '/' &&
        route.path.charAt(route.path.length - 1) !== '*' &&
        (route.path.lastIndexOf('.') === -1 ||
          route.path.lastIndexOf('.') < route.path.length - 4)
      ) {
        route.path += '/';
      }

      route.path = fastDecodeURI(route.path);

      if (route.path === '*' || route.baseUrl === '*') {
        route.all = true;
      } else if (route.path.indexOf(':') !== -1) {
        route.fetch_params = true;
        route.param_keys = [];
        route.path = pathToRegexp(route.path, route.param_keys);
        route.regex = true;
      } else if (route.path.indexOf('/*') !== -1) {
        route.baseUrl = route.path.substr(0, route.path.indexOf('/*') + 1);
        route.path = route.path.substr(route.baseUrl.length);
        route.all = true;
      } else if (
        route.baseUrl.length > 1 &&
        route.baseUrl.indexOf('/*') !== -1
      ) {
        route.baseUrl = route.baseUrl.substr(
          0,
          route.baseUrl.indexOf('/*') + 1
        );
        route.all = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.handler.toString().includes('await');
    route.legacy = route.handler.toString().includes('next(');

    if (route.legacy) {
      route.handler = legacyUtil(route.handler);
      route.async = true;
      route.await = true;
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

    debug(
      'route registered [%s] baseurl(%s) path(%s) - originalurl(%s)',
      route.method,
      route.baseUrl,
      route.path,
      route.originalUrl
    );

    return route;
  }

  on(
    method: HttpMethod,
    path: string | RegExp | Array<string | RegExp>,
    handler: HttpHandler<HttpMethod> | HttpHandler<HttpMethod>[],
    baseUrl: string,
    originalUrl: string
  ): this {
    if (Array.isArray(method)) {
      method.forEach((methodId) => {
        this.on(methodId, path, handler, baseUrl, originalUrl);
      });
      return this;
    }
    if (Array.isArray(path)) {
      path.forEach((pathId) => {
        this.on(method, pathId, handler, baseUrl, originalUrl);
      });
      return this;
    }
    if (Array.isArray(handler)) {
      handler.forEach((handlerId) => {
        this.on(method, path, handlerId, baseUrl, originalUrl);
      });
      return this;
    }

    this.routes.push(
      this.parse({ method, path, baseUrl, originalUrl, handler })
    );

    _gc();

    return this;
  }

  off(
    method: HttpMethod,
    path: string,
    handler: HttpHandler<HttpMethod>,
    baseUrl: string,
    originalUrl: string
  ): this {
    const parsed = this.parse({ method, path, baseUrl, originalUrl, handler });

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

    /* console.log(
      req,
      routes.map((route) => ({
        ...route,
        // @ts-ignore
        handler: route.handler.displayName || route.handler.name
      }))
    ); */
    for (let i = 0, len = routes.length; i < len; i += 1) {
      const route = routes[i];

      // Early return for performance reason
      if (res.done) {
        debug('routes lookup early exit');
        return res;
      }

      if (route.method === 'ANY' || route.method === req.method) {
        let found = false;
        if (route.all) {
          found =
            route.path && route.path !== '*'
              ? req.path.includes(route.path as string)
              : true;
        } else if (route.regex && (route.path as RegExp).test(req.path)) {
          found = true;
        } else if (route.path === req.path && route.baseUrl === req.baseUrl) {
          found = true;
        } else if (route.originalUrl === req.originalUrl) {
          found = true;
        } else if (route.baseUrl && req.path.startsWith(route.baseUrl)) {
          // TODO: How to fix falsely results?
          // found = true;
          // console.log('what?', req);
        } else {
          // console.log('not found', req, route);
        }

        if (found) {
          // Prepare url after found
          if (
            route.baseUrl !== '' &&
            route.baseUrl !== '*' &&
            req.path.indexOf(route.baseUrl) !== -1
          ) {
            req.baseUrl = route.baseUrl;
            req.path = req.path.substr(req.baseUrl.length);
            req.url = req.url.substr(req.baseUrl.length);

            // console.log('first match', req, route);
          } else if (
            route.baseUrl !== '' &&
            route.baseUrl !== '*' &&
            req.baseUrl === route.baseUrl
          ) {
            // console.log('second match', req, route);
            // when matches by baseUrl
          } else {
            // console.log('default match');
            // on other use-cases
          }

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

          // console.log('\n', 'RESPONSE', response, res, '\n');

          if (res.streaming || res.done || response === res) {
            debug('routes lookup was done');
            return res;
          }
          if (!res.streaming && !res.done && response) {
            return res.send(response as string | Record<string, unknown>);
          }
        }
      }
    }
  }
}
