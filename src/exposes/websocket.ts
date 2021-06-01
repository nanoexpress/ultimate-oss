import EventsEmitter from 'events';
import {
  HttpRequest,
  HttpResponse,
  us_socket_context_t,
  WebSocketBehavior
} from 'uWebSockets.js';

// eslint-disable-next-line max-lines-per-function
export default function exposeWebsocket(
  handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>,
  options = {}
): WebSocketBehavior {
  if (typeof (options as WebSocketBehavior).open === 'function') {
    return options;
  }

  return {
    ...options,
    open(ws): void {
      ws.emit('connection', ws);
    },
    async upgrade(
      res: HttpResponse,
      req: HttpRequest,
      context: us_socket_context_t
    ): Promise<void> {
      const secWsKey = req.getHeader('sec-websocket-key');
      const secWsProtocol = req.getHeader('sec-websocket-protocol');
      const secWsExtensions = req.getHeader('sec-websocket-extensions');

      const events = new EventsEmitter();

      res.on = events.on.bind(events);
      res.once = events.once.bind(events);
      res.off = events.off.bind(events);
      res.emit = events.emit.bind(events);

      let aborted = false;
      res.onAborted(() => {
        aborted = true;
        events.emit('error', { aborted });
      });

      res.emit('upgrade', req, res);

      try {
        await handler(req, res);
      } catch (error) {
        aborted = true;
        events.emit('error', error);
      }
      if (!aborted) {
        events.emit('willUpgrade', req);
        res.upgrade(
          { req, ...res },
          secWsKey,
          secWsProtocol,
          secWsExtensions,
          context
        );
        events.emit('upgraded', req);
      }
    },
    message: (ws, message, isBinary): void => {
      ws.emit('message', message, isBinary);
    },
    drain: (ws): void => {
      ws.emit('drain', ws.getBufferedAmount());
    },
    close: (ws, code, message): void => {
      ws.emit('close', code, message);
    }
  };
}
