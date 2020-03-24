export default (App) => {
  App.prototype.publish = function (topic, string, isBinary, compress) {
    this._route.publish(topic, string, isBinary, compress);
    return this;
  };
};
