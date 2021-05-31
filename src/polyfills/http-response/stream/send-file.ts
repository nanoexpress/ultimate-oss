import { createReadStream, statSync } from 'fs';
import { getMime } from '../../../helpers/mime';
import HttpResponse from '../http-response';

// eslint-disable-next-line max-lines-per-function, complexity
export default function sendFile(
  path: string,
  lastModified = true,
  compressed = false
): HttpResponse | undefined {
  // @ts-ignore
  const self = this as unknown as HttpResponse;
  // @ts-ignore
  const { req } = self;
  const { headers } = req;

  const stat = statSync(path);
  let { size } = stat;

  // handling last modified
  if (lastModified) {
    const { mtime } = stat;

    mtime.setMilliseconds(0);
    const mtimeutc = mtime.toUTCString();

    // Return 304 if last-modified
    if (headers && headers['if-modified-since']) {
      if (new Date(headers['if-modified-since']) >= mtime) {
        self.statusCode = 304;
        return self.end();
      }
    }
    self.setHeader('last-modified', mtimeutc);
  }
  self.setHeader('content-type', getMime(path) as string);

  // write data
  let start = 0;
  let end = 0;

  if (headers && headers.range) {
    [start, end] = headers.range
      .substr(6)
      .split('-')
      .map((byte: string) => (byte ? parseInt(byte, 10) : undefined));

    // Chrome patch for work
    if (end === undefined) {
      end = size - 1;
    }

    if (start !== undefined) {
      self.statusCode = 206;
      self.setHeader('accept-ranges', 'bytes');
      self.setHeader('content-range', `bytes ${start}-${end}/${size}`);
      size = end - start + 1;
    }
  }

  // for size = 0
  if (end < 0) {
    end = 0;
  }

  const createStreamInstance = end
    ? createReadStream(path, { start, end })
    : createReadStream(path);

  const pipe = self.pipe(createStreamInstance, size, compressed);

  return pipe;
}
