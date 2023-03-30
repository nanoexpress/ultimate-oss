import EventsEmitter from 'events';
import {
  HttpRequest,
  HttpResponse,
  us_socket_context_t,
  WebSocketBehavior,
  WebSocket
} from 'uWebSockets.js';

interface IWebSocket<UserData> extends WebSocket<UserData> {
  on(
    eventName:
      | 'connection'
      | 'error'
      | 'upgrade'
      | 'willUpgrade'
      | 'upgraded'
      | 'message'
      | 'drain'
      | 'close',
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    listener: (...args: any[]) => void
  ): void;
  emit(eventName: 'message', message: ArrayBuffer, isBinary: boolean): void;
  emit(eventName: 'connection', ws: IWebSocket<UserData>): void;
  emit(eventName: 'drain', drained: number): void;
  emit(eventName: 'close', code: number, message: ArrayBuffer): void;
}

type WebSocketOptions<UserData> = Omit<
  WebSocketBehavior<UserData>,
  'open' | 'message' | 'drain' | 'close'
>;

interface IWebSocketBehavior<UserData> extends WebSocketOptions<UserData> {
  open: (ws: IWebSocket<UserData>) => void;
  message: (
    ws: IWebSocket<UserData>,
    message: ArrayBuffer,
    isBinary: boolean
  ) => void;
  drain: (ws: IWebSocket<UserData>) => void;
  close: (ws: IWebSocket<UserData>, code: number, message: ArrayBuffer) => void;
}

export default function exposeWebsocket<UserData>(
  handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>,
  options: WebSocketBehavior<UserData> | WebSocketOptions<UserData> = {}
): IWebSocketBehavior<UserData> | WebSocketBehavior<UserData> {
  if (typeof (options as WebSocketBehavior<UserData>).open === 'function') {
    return options;
  }

  const behavior: IWebSocketBehavior<UserData> = {
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

  return behavior;
}
