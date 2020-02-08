import { HttpResponse } from './response-proto/http/index.js';
import * as Constants from './constants.js';
import { httpMethods } from './helpers/index.js';

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
    for (const middleware of middlewares) {
      if (middleware._module) {
        middleware._app = this._app;
        middleware._config = this._config;

        if (typeof path === 'string') {
          middleware._baseUrl = path;
        }
      } else if (middleware.constructor.name !== 'AsyncFunction') {
        throw new Error(
          '[nanoexpress] Only Async Functions are allowed to expose route'
        );
      }
    }
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

    this._prepareMiddlewares(path, middlewares);

    _middlewares.push(...middlewares);

    return this;
  }
  _prepareMethod(method, { originalUrl, path }, ...middlewares) {
    // eslint-disable-next-line no-unused-vars
    const { _baseUrl, _middlewares, _module, _config } = this;

    const handleError = _config._errorHandler;
    const jsonSpaces = _config.json_spaces;

    const fetchMethod = method.toUpperCase() === 'ANY';
    const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

    if (middlewares) {
      this._prepareMiddlewares(path, middlewares);
    }

    middlewares = Array.isArray(_middlewares)
      ? _middlewares.concat(middlewares)
      : middlewares;

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

          if (
            response === res ||
            (response &&
              (response.message ||
                response.stack_trace ||
                response.status_code))
          ) {
            if (response.status_code) {
              res.status(response.status_code);
            }
            skipCheck = true;
          }
        }
      }

      if (
        !skipCheck &&
        (method === 'OPTIONS' || res.stream === true || res.stream === 1)
      ) {
        skipCheck = true;
      }

      if (req.path === path) {
        if (res.serialize) {
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

httpMethods.forEach((method) => {
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
