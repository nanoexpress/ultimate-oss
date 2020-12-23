export default (App) => {
  App.prototype.publish = function _appWsPublish(
    topic,
    string,
    isBinary,
    compress
  ) {
    this._route.publish(topic, string, isBinary, compress);
    return this;
  };
};
