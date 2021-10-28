/* eslint-disable max-lines, max-lines-per-function, complexity, max-depth */
import analyze from '@nanoexpress/route-syntax-parser';
import fastDecodeURI from 'fast-decode-uri-component';
import { pathToRegexp } from 'path-to-regexp';
import {
  HttpHandler,
  HttpRequestExtended,
  PreparedRoute,
  UnpreparedRoute
} from '../types/find-route';
import { HttpMethod, INanoexpressOptions } from '../types/nanoexpress';
import { debug, invalid, iterateBlocks, slashify, _gc } from './helpers';
import { HttpResponse } from './polyfills';
import legacyUtil from './utils/legacy';

export default class RouteEngine {
  protected options: INanoexpressOptions;

  protected routes: PreparedRoute[];

  public async: boolean;

  public await: boolean;

  public params = false;

  public headers = false;

  public cookies = false;

  public query = false;

  public body = false;

  public property = false;

  constructor(options: INanoexpressOptions) {
    this.options = options;
    this.routes = [];
    this.async = false;
    this.await = false;
  }

  parse(incomingRoute: UnpreparedRoute): PreparedRoute {
    const { options: config } = this;

    const route: PreparedRoute = {
      ...incomingRoute,
      all: false,
      regex: false,
      fetch_params: false,
      async: false,
      await: false,
      legacy: false,
      analyzeBlocks: []
    };

    if (typeof route.path === 'string') {
      if (config.ignoreTrailingSlash) {
        route.path = slashify(route.path);
        route.originalUrl = slashify(route.originalUrl);
      }

      route.path = fastDecodeURI(route.path);

      if (route.baseUrl === '*') {
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
        route.baseUrl = route.baseUrl.substring(0, route.baseUrl.indexOf('/*'));
        route.originalUrl = route.originalUrl.substring(
          0,
          route.originalUrl.indexOf('/*') + 1
        );
        route.all = true;
      }
    } else if (route.path instanceof RegExp) {
      route.regex = true;
    }
    route.async = route.handler.constructor.name === 'AsyncFunction';
    route.await = route.handler.toString().includes('await');
    route.legacy = route.handler.toString().includes('next(');
    route.analyzeBlocks = analyze<HttpHandler<HttpMethod>>(route.handler);
    const usedBlocks = iterateBlocks(route.analyzeBlocks);

    if (route.legacy) {
      if (config.enableExpressCompatibility) {
        route.handler = legacyUtil(route.handler);
        route.async = true;
        route.await = true;
      } else {
        invalid(
          'Express.js compatibility mode is disabled, please enable before using *express.js* middlewares, but take care - performance will not be same as disabled'
        );
      }
    }

    if (!this.params && route.fetch_params) {
      this.params = true;
    }
    if (!this.async && route.async) {
      this.async = true;
    }
    if (!this.await && route.await) {
      this.await = true;
    }



    usedBlocks.forEach((blockName): void => {
      if (blockName === 'property') {
        //
      } else {
        if (!this[blockName]) {
          this[blockName] = true;
        }
      }
    });

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

  async lookup(
    req: HttpRequestExtended<HttpMethod>,
    res: HttpResponse
  ): Promise<HttpResponse | string | void> {
    const { routes, options } = this;
    let response;

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
              : route.originalUrl === '*' || req.originalUrl.substr(route.originalUrl.length).length > 1;
        } else if (route.regex && (route.path as RegExp).test(req.path)) {
          found = true;
        } else if (route.path === req.path && route.baseUrl === req.baseUrl) {
          found = true;
        } else if (route.originalUrl === req.originalUrl) {
          found = true;
        }

        if (found) {
          if (route.fetch_params && route.param_keys) {
            const exec = (route.path as RegExp).exec(req.path);

            req.params = {} as Record<string, string>;
            for (
              let p = 0, lenp = route.param_keys.length;
              exec && p < lenp;
              p += 1
            ) {
              const key = route.param_keys[p].name;
              const value = exec[p + 1];

              req.params[key] = value;
            }
          }

          // Prepare url after found
          if (
            options.enableExpressCompatibility &&
            route.baseUrl !== '' &&
            route.baseUrl !== '*' &&
            req.path.indexOf(route.baseUrl) === 0
          ) {
            req.baseUrl = route.baseUrl;
            req.path = req.originalUrl.substr(req.baseUrl.length);
            req.url = req.originalUrl.substr(req.baseUrl.length);
          }

          if (route.async || route.legacy) {
            response = await route.handler(req, res);
          } else {
            response = route.handler(req, res);
          }

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
