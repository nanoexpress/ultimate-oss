import { resConfig } from '../../../constants.js';

export default function send(response) {
  const config = this[resConfig];

  if (this.compiledResponse) {
    return this.end(this.compiledResponse);
  } else if (this.serialize) {
    return this.end(this.serialize(response));
  } else if (typeof response === 'object') {
    return this.end(JSON.stringify(response, null, config.json_spaces));
  } else {
    return this.end(response);
  }
}
