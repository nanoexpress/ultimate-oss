import { resHeaders } from '../../../constants.js';

export default function getHeader(key) {
  return !!this[resHeaders] && !!key && this[resHeaders][key];
}
