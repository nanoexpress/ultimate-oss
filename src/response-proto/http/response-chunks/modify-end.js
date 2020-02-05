export default function modifyEnd() {
  if (!this._modifiedEnd) {
    const _oldEnd = this.end;

    this.end = function(chunk, encoding) {
      // eslint-disable-next-line prefer-const
      let { _headers, statusCode, rawStatusCode = 200 } = this;

      // Polyfill for express-session and on-headers module
      if (!this.writeHead.notModified) {
        this.writeHead(rawStatusCode, _headers);
        this.writeHead.notModified = true;
        _headers = this._headers;
      }

      if (_headers) {
        this.applyHeadersAndStatus();
      }
      if (statusCode && rawStatusCode !== 200) {
        this.writeStatus(statusCode);
      }

      return encoding
        ? _oldEnd.call(this, chunk, encoding)
        : _oldEnd.call(this, chunk);
    };

    this._modifiedEnd = true;
  }
  return this;
}
