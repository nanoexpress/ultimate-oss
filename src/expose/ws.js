import { EventEmitter } from 'events';

const defaultOptions = {
  compression: 0,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 120
};
// eslint-disable-next-line max-lines-per-function
export default function webSocket({ path, originalUrl }, options, fn) {
  if (options) {
    options = { ...defaultOptions, ...options };
  } else {
    options = { ...defaultOptions };
  }

  const { _baseUrl } = this;
  const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

  return {
    ...options,
    open(ws) {
      const { req } = ws;

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
    async upgrade(res, req, context) {
      const headers = {};
      req.forEach((key, value) => {
        headers[key] = value;
      });
      req.headers = headers;

      if (options.upgrade) {
        res.onAborted(() => {
          res.isAborted = true;
        });
        await options.upgrade(req, res);
      }

      if (res.isAborted) {
        return;
      }

      res.upgrade(
        { req },
        /* Spell these correctly */
        req.headers['sec-websocket-key'],
        req.headers['sec-websocket-protocol'],
        req.headers['sec-websocket-extensions'],
        context
      );
    },
    message(ws, message, isBinary) {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf-8');
      }
      ws.emit('message', message, isBinary);
    },
    drain(ws) {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close(ws, code, message) {
      ws.emit('close', code, Buffer.from(message).toString('utf-8'));
    }
  };
}
