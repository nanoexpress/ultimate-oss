import { HttpResponse } from './response-proto/http/index.js';
import { httpMethods } from './helpers/index.js';
import BasicExperimentalCompiler from './compiler.js';

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

    middlewares.forEach((middleware) => {
      if (middleware._module) {
        middleware._app = this._app;

        if (typeof path === 'string') {
          middleware._baseUrl = path;
        }
      }
    });

    _middlewares.push(...middlewares);

    return this;
  }
  _prepareMethod(method, { originalUrl, path }, ...middlewares) {
    // eslint-disable-next-line no-unused-vars
    const { _baseUrl, _middlewares, _module } = this;

    const fetchMethod = method.toUpperCase() === 'ANY';
    const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

    const findConfig = middlewares.find(
      (middleware) =>
        typeof middleware === 'object' && middleware.isRaw !== undefined
    );
    const isRaw = findConfig ? findConfig.isRaw : false;
    const isBasicExperimentalCompiler = findConfig
      ? findConfig.experimentalCompiler !== false
      : true;

    middlewares = _middlewares ? _middlewares.concat(middlewares) : middlewares;

    // console.log({ length: middlewares.length }, middlewares[0].toString());

    if (middlewares.length === 1 && isBasicExperimentalCompiler) {
      const compiledFunction = BasicExperimentalCompiler(middlewares[0]);

      if (compiledFunction) {
        return compiledFunction;
      }
    }

    const handleError = (err) => ({
      status: 'error',
      stack_trace: err.stack,
      message: err.message,
      code: err.code
    });

    return async (res, req) => {
      req.method = fetchMethod ? req.getMethod().toUpperCase() : method;
      req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
      req.baseUrl = _baseUrl || '';

      // Aliases for polyfill
      req.url = req.path;
      req.originalUrl = originalUrl;

      let response;
      let skipCheck = false;

      // Aliases for future usage and easy-access
      if (!isRaw) {
        req.__response = res;
        res.__request = req;

        // Extending proto
        const { __proto__ } = res;
        for (const newMethod in HttpResponse) {
          __proto__[newMethod] = HttpResponse[newMethod];
        }
        res.writeHead.notModified = true;
      }

      if (!isRaw && middlewares && middlewares.length > 0) {
        for (const middleware of middlewares) {
          if (skipCheck) {
            break;
          }
          if (typeof middleware !== 'function') {
            continue;
          }

          response = await middleware(req, res).catch(handleError);

          if (response === res || (response && response.stack_trace)) {
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

      if (!fetchUrl || req.path === path) {
        if (
          !skipCheck &&
          !isRaw &&
          !res._modifiedEnd &&
          (!res.writeHead.notModified || res._headers)
        ) {
          res.modifyEnd();
        }

        if (res.serialize) {
          res.end(res.serialize(response));
        } else if (typeof response === 'object') {
          res.end(JSON.stringify(response, null, 4));
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
