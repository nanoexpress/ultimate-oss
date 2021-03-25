import _gc from '../../helpers/gc.js';
import exposeWs from '../ws.js';

export default (Route) => {
  Route.prototype.ws = function _routeWs(path, fn, options) {
    const { _baseUrl, _module, _app } = this;

    let originalUrl = path;
    if (_baseUrl !== '' && _module && originalUrl.indexOf(_baseUrl) === -1) {
      originalUrl = String(_baseUrl) + String(path);
    }

    _gc();

    _app.ws(
      originalUrl,
      exposeWs.call(this, { path, originalUrl }, fn, options)
    );

    return this;
  };
};
