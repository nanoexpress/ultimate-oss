import { HttpResponse } from './polyfills/index.js';
import * as Constants from './constants.js';
import _gc from './helpers/gc.js';

export default class Route {
  constructor() {
    this._middlewares = null;

    this._baseUrl = '';

    this._module = true;
    this._rootLevel = false;
  }
  get raw() {
    return this._app;
  }
  _prepareMiddlewares(path, middlewares) {
    return middlewares.map((middleware) => {
      if (middleware.constructor.name !== 'AsyncFunction') {
        throw new Error(
          '[nanoexpress] Only Async Functions are allowed to expose route'
        );
      }
      if (middleware._module) {
        return {
          ...middleware,
          _app: this._app,
          _config: this._config,
          _baseUrl: typeof path === 'string' ? path : middleware._baseUrl || '/'
        };
      }
      return middleware;
    });
  }
  use(path, ...middlewares) {
    let { _middlewares } = this;

    if (!_middlewares) {
      _middlewares = [];
      this._middlewares = _middlewares;
    }

    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = undefined;
    }

    _middlewares.push(...this._prepareMiddlewares(path, middlewares));

    return this;
  }
  _prepareMethod(method, { originalUrl, path }, ...middlewares) {
    // eslint-disable-next-line no-unused-vars
    const { _baseUrl, _middlewares, _module, _config } = this;

    const handleError = _config._errorHandler;
    const jsonSpaces = _config.json_spaces;

    const fetchMethod = method.toUpperCase() === 'ANY';
    const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

    if (middlewares && middlewares.length > 1) {
      middlewares = this._prepareMiddlewares(path, middlewares);
      middlewares = Array.isArray(_middlewares)
        ? _middlewares.concat(middlewares)
        : middlewares;
    }

    _gc();

    return async (res, req) => {
      req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
      req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
      req.baseUrl = _baseUrl || '';

      // Aliases for polyfill
      req.url = req.path;
      req.originalUrl = originalUrl;

      let response;
      let skipCheck = false;
      let newMethod;

      // Aliases for future usage and easy-access
      req[Constants.__request] = res;
      res[Constants.__response] = req;
      res[Constants.resConfig] = _config;

      // Extending HttpResponse
      for (let i = 0, len = Constants.HttpResponseKeys.length; i < len; i++) {
        newMethod = Constants.HttpResponseKeys[i];
        res.__proto__[newMethod] = HttpResponse[newMethod];
      }

      if (middlewares && middlewares.length > 0) {
        for (const middleware of middlewares) {
          if (skipCheck) {
            break;
          }
          if (typeof middleware !== 'function') {
            continue;
          }

          response = await middleware(req, res).catch(handleError);

          if (response === res) {
            skipCheck = true;
          } else if (
            response &&
            (response.message || response.stack_trace || response.status_code)
          ) {
            if (response.status_code) {
              res.status(response.status_code);
            }
            skipCheck = false;
          }
        }
      }

      if (
        !skipCheck &&
        (method === 'OPTIONS' || res.stream === true || res.stream === 1)
      ) {
        skipCheck = true;
      }

      if (!skipCheck && req.path === path) {
        middlewares = null;
        if (res.compiledResponse) {
          return res.end(res.compiledResponse);
        } else if (res.serialize) {
          res.end(res.serialize(response));
        } else if (typeof response === 'object') {
          res.end(JSON.stringify(response, null, jsonSpaces));
        } else {
          res.end(response);
        }
      }
    };
  }
}

Constants.httpMethods.forEach((method) => {
  Route.prototype[method] = function(path, ...middlewares) {
    const { _baseUrl, _module, _app } = this;

    let originalUrl = path;
    if (middlewares.length > 0) {
      if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
        originalUrl = _baseUrl + path;
      }

      if (originalUrl && originalUrl[originalUrl.length - 1] === '/') {
        originalUrl = originalUrl.substr(0, originalUrl.length - 1);
      }

      _app[method](
        originalUrl + '/',
        this._prepareMethod(
          method.toUpperCase(),
          { path, originalUrl },
          ...middlewares
        )
      );
    }

    return this;
  };
});
