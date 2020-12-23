import { resAbortHandler } from '../../../constants.js';

export default function resPipe(stream, size, compressed = false) {
  if (compressed) {
    const compressedStream = this.compressStream(stream);

    if (compressedStream) {
      stream = compressedStream;
    }
  }
  if (!this[resAbortHandler]) {
    this.onAborted(() => {
      this.aborted = true;
    });
    this[resAbortHandler] = true;
  }

  this.stream = stream;

  if (compressed || !size) {
    stream.on('data', (buffer) => {
      if (this.aborted) {
        stream.destroy();
        return;
      }
      this.write(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  } else {
    stream.on('data', (buffer) => {
      if (this.aborted) {
        stream.destroy();
        return;
      }
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
          const [writeOk, writeDone] = this.tryEnd(
            buffer.slice(offset - lastOffset),
            size
          );
          if (writeDone) {
            stream.end();
          } else if (writeOk) {
            stream.resume();
          }
          return writeOk;
        });
      }
    });
  }
  stream
    .on('error', () => {
      this.stream = -1;
      stream.destroy();
      this.end();
    })
    .on('end', () => {
      this.stream = 1;
      this.end();
    });

  return this;
}
