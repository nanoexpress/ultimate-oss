import { httpMethods } from '../../constants.js';

export default (Route) => {
  httpMethods.forEach((method) => {
    Route.prototype[method] = function _routeExposeHTTP(path, ...middlewares) {
      const { _baseUrl, _module, _app } = this;

      let originalUrl = path;
      if (middlewares.length > 0) {
        if (
          _baseUrl !== '' &&
          _module &&
          originalUrl.indexOf(_baseUrl) === -1
        ) {
          originalUrl = String(_baseUrl) + String(path);
        }

        _app[method](
          originalUrl,
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
};
