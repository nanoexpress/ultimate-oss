import { ReadStream } from 'fs';
import {
  BrotliCompress,
  BrotliOptions,
  createBrotliCompress,
  createDeflate,
  createGzip,
  Deflate,
  Gzip,
  ZlibOptions
} from 'zlib';
import HttpResponse from '../http-response';

const priority = ['gzip', 'br', 'deflate'];

export default function compressStream(
  stream: ReadStream,
  options?: BrotliOptions | ZlibOptions
): BrotliCompress | Gzip | Deflate | null {
  // @ts-ignore
  const self = this as unknown as HttpResponse;
  // @ts-ignore
  const { req } = self;

  if (!req) {
    throw new Error(
      'This method requires active `HttpRequest`. Please load required middleware'
    );
  }
  if (!req.headers) {
    throw new Error(
      'This method requires active `HttpRequest.headers`. Please load required middleware'
    );
  }
  const contentEncoding = req.headers['content-encoding'];
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

  if (compression && encoding) {
    stream.pipe(compression);
    self.setHeader('content-encoding', encoding);
  }

  return compression;
}
