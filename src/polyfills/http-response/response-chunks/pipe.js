import compressStream from '../stream/compress-stream.js';
import { __request } from '../../../constants.js';

export default function(stream, size, compressed = false) {
  const req = this[__request];
  const { headers, responseHeaders } = req;

  this.stream = true;

  if (compressed) {
    const compressedStream = compressStream(stream, responseHeaders || headers);

    if (compressedStream) {
      stream = compressedStream;
    }
  }

  if (compressed || !size) {
    stream.on('data', (buffer) => {
      this.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    stream.on('data', (buffer) => {
      buffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const lastOffset = this.getWriteOffset();

      // First try
      const [ok, done] = this.tryEnd(buffer, size);

      if (done) {
        stream.destroy();
      } else if (!ok) {
        // pause because backpressure
        stream.pause();

        // Register async handlers for drainage
        this.onWritable((offset) => {
          const [ok, done] = this.tryEnd(
            buffer.slice(offset - lastOffset),
            size
          );
          if (done) {
            stream.end();
          } else if (ok) {
            stream.resume();
          }
          return ok;
        });
      }
    });
  }
  stream
    .on('error', () => {
      this.stream = -1;
      stream.destroy();
    })
    .on('end', () => {
      this.stream = 1;
      this.end();
    });

  return this;
}
