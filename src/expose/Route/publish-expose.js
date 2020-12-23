import _gc from '../../helpers/gc.js';

export default (Route) => {
  Route.prototype.publish = function _routeWsPublish(
    topic,
    string,
    isBinary,
    compress
  ) {
    _gc();

    this._app.publish(topic, string, isBinary, compress);
  };
};
