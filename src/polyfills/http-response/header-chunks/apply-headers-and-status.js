export default function applyHeadersAndStatus() {
  const { _headers } = this;

  for (const header in _headers) {
    const value = _headers[header];

    if (value) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, value);
      }
      this.removeHeader(header);
    }
  }

  return this;
}
