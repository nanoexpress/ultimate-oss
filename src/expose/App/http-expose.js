import { httpMethods } from '../../constants.js';

export default (App) => {
  httpMethods.forEach((method) => {
    App.prototype[method] = function(path, ...fns) {
      const { _app, _route, _anyRouteCalled } = this;

      if (fns.length > 0) {
        const preparedRouteFunction = _route._prepareMethod(
          method.toUpperCase(),
          { path, originalUrl: path },
          ...fns
        );

        _app[method](path, preparedRouteFunction);

        this._routeCalled = true;

        if (!_anyRouteCalled && method !== 'options') {
          this._anyRouteCalled = path === '/*';
        }

        if (method === 'options') {
          this._optionsCalled = true;
        }
      }
      return this;
    };
  });
};
