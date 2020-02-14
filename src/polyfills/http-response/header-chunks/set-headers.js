import { resHeaders } from '../../../constants.js';

export default function setHeaders(headers) {
  for (const header in headers) {
    if (this[resHeaders]) {
      const currentHeader = this[resHeaders][header];
      if (currentHeader !== undefined || currentHeader !== null) {
        continue;
      }
    }
    this.setHeader(header, headers[header]);
  }

  return this;
}
