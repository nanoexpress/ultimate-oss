export default function (stream, size, compressed = false) {
  if (compressed) {
    const compressedStream = this.compressStream(stream);

    if (compressedStream) {
      stream = compressedStream;
    }
  }

  this.stream = stream;
  this.onAborted(() => {
    this.aborted = true;
    stream.destroy();
  });

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
      this.end();
    })
    .on('end', () => {
      this.stream = 1;
      this.end();
    });

  return this;
}
