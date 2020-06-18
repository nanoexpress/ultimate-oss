import { EventEmitter } from 'events';

const defaultOptions = {
  compression: 0,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 120
};
export default function ({ path, originalUrl }, fn, options) {
  if (options) {
    options = Object.assign({}, defaultOptions, options);
  } else {
    options = Object.assign({}, defaultOptions);
  }

  const { _baseUrl } = this;
  const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

  return {
    ...options,
    open: (ws, req) => {
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

      fn(req, ws);
    },
    upgrade: (ws, req, context) => {
      if (options.upgrade) {
        options.upgrade(req, ws, context);
      }
      ws.emit('upgrade', req, context);
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
