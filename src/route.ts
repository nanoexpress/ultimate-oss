import { RecognizedString, WebSocket, WebSocketBehavior } from 'uWebSockets.js';
import { HttpHandler, UnpreparedRoute } from '../typings/find-route';
import { IWebsocketRoute } from '../typings/nanoexpress';
import FindRoute from './find-route';
import { invalid, _gc } from './helpers';

export default class Route {
  _routers: UnpreparedRoute[];

  _ws: IWebsocketRoute[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _app: any;

  _basePath: string;

  constructor() {
    this._routers = [];
    this._ws = [];
    this._app = null;
    this._basePath = '';

    return this;
  }

  use(path: string | HttpHandler, ...middlewares: HttpHandler[]): this {
    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = '*';
    }
    middlewares.forEach((handler) => {
      if (this._app) {
        const routePath =
          // eslint-disable-next-line no-nested-ternary
          this._basePath === '*'
            ? '*'
            : path === '/'
            ? this._basePath
            : `${this._basePath}${path}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this._app._router as FindRoute).on('ANY', routePath, handler);
      } else {
        this._routers.push({ method: 'ANY', path, handler } as UnpreparedRoute);
      }
    });

    _gc();

    return this;
  }

  publish(
    topic: RecognizedString,
    message: RecognizedString,
    isBinary?: boolean,
    compress?: boolean
  ): boolean {
    if (this._app) {
      return this._app.publish(topic, message, isBinary, compress);
    }
    invalid(
      'nanoexpress [Router]: Please attach to `Application` before using publish'
    );
    return false;
  }

  ws(
    path: RecognizedString,
    handler: (ws: WebSocket) => void | WebSocketBehavior,
    options?: WebSocketBehavior
  ): this {
    if (typeof handler === 'object' && (handler as WebSocketBehavior).open) {
      this._ws.push({ path, handler: options } as IWebsocketRoute);
      return this;
    }

    this._ws.push({ path, handler, options } as IWebsocketRoute);

    _gc();

    return this;
  }
}
