import { resHeaders } from '../../../constants.js';

export default function removeHeader(key) {
  if (!this[resHeaders] || !this[resHeaders][key]) {
    return undefined;
  }
  this[resHeaders][key] = null;

  return this;
}
