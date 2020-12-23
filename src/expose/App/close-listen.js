import uWS from 'uWebSockets.js';
import _gc from '../../helpers/gc.js';

export default (App) => {
  App.prototype._close = function _appCloseListen(token, id) {
    const { _console } = this;

    if (token) {
      const _debugContext = _console.debug ? _console : console;

      uWS.us_listen_socket_close(token);
      this._instance[id] = null;
      _debugContext.debug('[Server]: stopped successfully');
      _gc();
      return true;
    }

    const _errorContext = _console.error ? _console : console;

    _errorContext.error('[Server]: Error, failed while stopping');
    _gc();
    return false;
  };
};
