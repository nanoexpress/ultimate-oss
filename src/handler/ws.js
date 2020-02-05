import Events from '@dalisoft/events';

const __wsProto__ = Events.prototype;

export default (path, fn, options) => {
  options = {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 120,
    ...options
  };

  const fetchUrl = path.indexOf('*') !== -1 || path.indexOf(':') !== -1;

  return {
    ...options,
    open: (ws, req) => {
      req.path = path;
      req.url = path;
      req.baseUrl = '';
      req.originalUrl = fetchUrl ? req.getUrl() : path;

      if (!ws.___events) {
        ws.on = __wsProto__.on;
        ws.once = __wsProto__.once;
        ws.off = __wsProto__.off;
        ws.emit = __wsProto__.emit;

        ws.___events = [];
      }
      fn(req, ws);
    },
    message: (ws, message, isBinary) => {
      if (!isBinary) {
        message = Buffer.from(message).toString('utf-8');
      }
      if (options.schema) {
        if (typeof message === 'string') {
          if (message.indexOf('[') === 0 || message.indexOf('{') === 0) {
            if (message.indexOf('[object') === -1) {
              message = JSON.parse(message);
            }
          }
        }
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
};
