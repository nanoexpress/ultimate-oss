export default (App) => {
  App.prototype._prepareListen = function () {
    const { _routeCalled, _optionsCalled, _config: config } = this;

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
      this.any('/*', notFoundHandler);
    }
  };
};
