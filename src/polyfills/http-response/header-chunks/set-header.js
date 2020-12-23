import { resHeaders } from '../../../constants.js';

export default function setHeader(key, value) {
  if (!this[resHeaders]) {
    this[resHeaders] = {};
  }
  this[resHeaders][key] = value;
  return this;
}
