import * as Constants from '../constants.js';
import exposeWs from './ws.js';
import _gc from '../helpers/gc.js';

export default (Route) => {
  Constants.httpMethods.forEach((method) => {
    Route.prototype[method] = function(path, ...middlewares) {
      const { _baseUrl, _module, _app } = this;

      let originalUrl = path;
      if (middlewares.length > 0) {
        if (
          _baseUrl !== '' &&
          _module &&
          originalUrl.indexOf(_baseUrl) === -1
        ) {
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

  Route.prototype.ws = function routeWs(path, fn, options) {
    const { _baseUrl, _module, _app } = this;

    let originalUrl = path;
    if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
      originalUrl = _baseUrl + path;
    }

    if (originalUrl && originalUrl[originalUrl.length - 1] === '/') {
      originalUrl = originalUrl.substr(0, originalUrl.length - 1);
    }

    _gc();

    _app.ws(
      originalUrl,
      exposeWs.call(this, { path, originalUrl }, fn, options)
    );

    return this;
  };
  Route.prototype.publish = function publish(
    topic,
    string,
    isBinary,
    compress
  ) {
    this._app.publish(topic, string, isBinary, compress);
  };
  return Route;
};
