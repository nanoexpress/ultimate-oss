export default (App) => {
  App.prototype.ws = function _appWs(path, fn, options) {
    this._route.ws(path, fn, options);
    return this;
  };
};
