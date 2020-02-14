import { resHeaders } from '../../../constants.js';

export default function removeHeader(key) {
  if (!this[resHeaders] || !this[resHeaders][key]) {
    return undefined;
  }
  !this._modifiedEnd && this.modifyEnd && this.modifyEnd();
  this[resHeaders][key] = null;
  delete this[resHeaders][key];

  return this;
}
