import {
  AppOptions,
  HttpRequest as uWS_HttpRequest,
  RecognizedString,
  WebSocket,
  WebSocketBehavior
} from 'uWebSockets.js';
import { HttpMethod } from './find-route';

export interface INanoexpressOptions {
  isSSL?: boolean;
  https?: AppOptions & { separateServer?: number | boolean };
  ignoreTrailingSlash: boolean;
  poolSize?: number;
  console?: Console;
  json_spaces?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json_replacer?: (this: any, key: string, value: any) => any;
}

export interface HttpRequest extends uWS_HttpRequest {
  url: string;
  path: string;
  method: HttpMethod;
  stream: boolean;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export type WebSocketHandler = (ws: WebSocket) => void | WebSocketBehavior;

export interface IWebsocketRoute {
  path: RecognizedString;
  options: WebSocketBehavior;
}
