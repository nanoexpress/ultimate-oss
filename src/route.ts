import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import { invalid, _gc } from './helpers';
import { HttpHandler, HttpMethod, UnpreparedRoute } from './types/find-route';
import { IWebsocketRoute } from './types/nanoexpress';

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

  on(method: HttpMethod, path: string, handler: HttpHandler): this {
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;
    if (this._app) {
      this._app.on(method, normalisedPath, handler);
    } else {
      this._routers.push({ method, path: normalisedPath, handler });
    }

    return this;
  }

  use(path: string | HttpHandler, ...middlewares: HttpHandler[]): this {
    if (typeof path === 'function') {
      middlewares.unshift(path);
      path = '*';
    }
    middlewares.forEach((handler) => {
      this.on('ANY', path as string, handler);
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

  ws(path: RecognizedString, options?: WebSocketBehavior): this {
    const normalisedPath =
      // eslint-disable-next-line no-nested-ternary
      this._basePath === '*'
        ? '*'
        : path === '/'
        ? this._basePath
        : `${this._basePath}${path}`;
    this._ws.push({ path: normalisedPath, options } as IWebsocketRoute);

    return this;
  }
}
