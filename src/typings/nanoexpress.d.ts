import {
  AppOptions,
  HttpRequest,
  RecognizedString,
  WebSocket,
  WebSocketBehavior
} from 'uWebSockets.js';
import { HttpMethod } from './find-route';

export interface INanoexpressOptions {
  isSSL?: boolean;
  https?: AppOptions & { separateServer?: number | boolean };
  console?: Console;
}

export interface IWebsocketRoute {
  path: RecognizedString;
  handler?: (ws: WebSocket) => void | WebSocketBehavior;
  options: WebSocketBehavior;
}

export interface HttpRequestExtended extends HttpRequest {
  method: HttpMethod;
  path: string;
  params?: Record<string, string>;
}
