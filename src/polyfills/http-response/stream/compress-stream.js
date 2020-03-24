import { createBrotliCompress, createGzip, createDeflate } from 'zlib';
import { __request } from '../../../constants.js';

const priority = ['gzip', 'br', 'deflate'];

export default function (stream) {
  const req = this[__request];
  const { headers } = req;

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
      ? createBrotliCompress()
      : encoding === 'gzip'
      ? createGzip()
      : encoding === 'deflate'
      ? createDeflate()
      : null;

  if (compression) {
    stream.pipe(compression);

    headers['Content-Encoding'] = encoding;
  }

  return compression;
}
