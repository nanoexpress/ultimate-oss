import { resHeaders } from '../../../constants.js';

export default function hasHeader(key) {
  return (
    !!this[resHeaders] &&
    this[resHeaders][key] !== undefined &&
    this[resHeaders][key] !== null
  );
}
