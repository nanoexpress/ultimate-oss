import * as HttpResponseChunks from './response-chunks/index.js';

import * as HttpResponseHeaderResponse from './header-chunks/index.js';
import * as HttpResponsePolyfill from './polyfill-chunks/index.js';

import * as HttpResponseStream from './stream/index.js';

const HttpResponse = {
  ...HttpResponseHeaderResponse,
  ...HttpResponseChunks,
  ...HttpResponsePolyfill,
  ...HttpResponseStream
};

export default HttpResponse;
