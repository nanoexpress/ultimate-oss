import { resHeaders } from '../../../constants.js';

export default function setHeaders(headers, overwrite) {
  for (const header in headers) {
    if (!overwrite && this[resHeaders]) {
      const currentHeader = this[resHeaders][header];
      if (currentHeader !== undefined || currentHeader !== null) {
        continue;
      }
    }
    this.setHeader(header, headers[header]);
  }

  return this;
}
