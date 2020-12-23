import { resConfig, resHeaders } from '../../../constants.js';

export default function send(response, autoHeaders = true) {
  const headers = this[resHeaders];
  const config = this[resConfig];

  if (autoHeaders && headers) {
    this.applyHeaders();
  }
  if (this.compiledResponse) {
    return this.end(this.compiledResponse);
  }
  if (this.serialize) {
    return this.end(this.serialize(response));
  }
  if (typeof response === 'object') {
    this.writeHeader('Content-Type', 'application/json; charset=utf-8');
    return this.end(JSON.stringify(response, null, config.json_spaces));
  }
  return this.end(response);
}
