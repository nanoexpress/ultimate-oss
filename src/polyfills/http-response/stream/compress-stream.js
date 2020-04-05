import { createBrotliCompress, createGzip, createDeflate } from 'zlib';
import { __request, reqHeaderResponse } from '../../../constants.js';

const priority = ['gzip', 'br', 'deflate'];

export default function (stream, options) {
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
    (encoding) => contentEncoding && contentEncoding.indexOf(encoding) !== -1
  );

  const compression =
    encoding === 'br'
      ? createBrotliCompress(options)
      : encoding === 'gzip'
      ? createGzip(options)
      : encoding === 'deflate'
      ? createDeflate(options)
      : null;

  if (compression) {
    stream.pipe(compression);

    responseHeaders['content-encoding'] = encoding;
  }

  return compression;
}
