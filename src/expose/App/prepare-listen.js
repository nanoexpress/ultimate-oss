export default (App) => {
  App.prototype._prepareListen = function () {
    const { _routeCalled, _optionsCalled, _console, _config: config } = this;

    if (!_routeCalled) {
      const _errorContext = _console.warn ? _console : console;

      _errorContext.warn(
        'nanoexpress [Server::Warning]: None of middleware will be called until you define route'
      );
    }

    // Polyfill for plugins like CORS
    if (_routeCalled && !_optionsCalled) {
      this.options('/*', async (req, res) => res.end(''));
    }

    if (!this._anyRouteCalled) {
      const notFoundHandler =
        config._notFoundHandler ||
        (async (req, res) => {
          res.writeStatus('404 Not Found');
          res.end(
            JSON.stringify({ code: 404, message: 'The route does not exist' })
          );
        });
      this.all('/*', notFoundHandler);
    }
  };
};
