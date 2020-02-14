import { resHeaders } from '../../../constants.js';

export default function setHeader(key, value) {
  !this._modifiedEnd && this.modifyEnd && this.modifyEnd();

  if (!this[resHeaders]) {
    this[resHeaders] = {};
  }
  this[resHeaders][key] = value;
  return this;
}
