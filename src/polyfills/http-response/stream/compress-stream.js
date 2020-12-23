import { createBrotliCompress, createDeflate, createGzip } from 'zlib';
import { reqHeaderResponse, __request } from '../../../constants.js';

const priority = ['gzip', 'br', 'deflate'];

export default function compressStream(stream, options) {
  const req = this[__request];
  const { headers } = req;
  const responseHeaders = req[reqHeaderResponse];

  if (!headers) {
    throw new Error(
      'This method requires active `headers` property in HttpRequest. Please load required middleware'
    );
  }
  const contentEncoding = headers['accept-encoding'];
  const encoding = priority.find(
    (currentEncoding) =>
      contentEncoding && contentEncoding.indexOf(currentEncoding) !== -1
  );

  let compression = null;

  if (encoding === 'br') {
    compression = createBrotliCompress(options);
  } else if (encoding === 'gzip') {
    compression = createGzip(options);
  } else if (encoding === 'deflare') {
    compression = createDeflate(options);
  }

  if (compression) {
    stream.pipe(compression);

    responseHeaders['content-encoding'] = encoding;
  }

  return compression;
}
