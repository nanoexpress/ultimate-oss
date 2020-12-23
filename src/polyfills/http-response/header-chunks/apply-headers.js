import { resHeaders } from '../../../constants.js';

export default function applyHeaders() {
  const _headers = this[resHeaders];

  for (const header in _headers) {
    const value = _headers[header];

    if (value !== null && value !== undefined) {
      if (value.splice) {
        this.writeHeaderValues(header, value);
      } else {
        this.writeHeader(header, `${value}`);
      }
      this.removeHeader(header);
    }
  }

  return this;
}
