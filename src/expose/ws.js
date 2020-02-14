import { EventEmitter } from 'events';

export default function({ path, originalUrl }, fn, options) {
  options = {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 120,
    ...options
  };
  const { _baseUrl } = this;
  const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

  return {
    ...options,
    open: async (ws, req) => {
      req.baseUrl = _baseUrl || '';
      req.path = fetchUrl ? req.getUrl().substr(_baseUrl.length) : path;
      req.url = req.path;

      req.originalUrl = originalUrl;
      req.method = 'ws';

      const ev = new EventEmitter();

      ws.on = ev.on.bind(ev);
      ws.once = ev.once.bind(ev);
      ws.off = ev.off.bind(ev);
      ws.emit = ev.emit.bind(ev);

      await fn(req, ws);
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf-8');
      }
      ws.emit('message', message, isBinary);
    },
    drain: (ws) => {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      ws.emit('close', code, Buffer.from(message).toString('utf-8'));
    }
  };
}
