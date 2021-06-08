import {
  AppOptions,
  RecognizedString,
  WebSocket,
  WebSocketBehavior
} from 'uWebSockets.js';

export interface INanoexpressOptions {
  isSSL?: boolean;
  https?: AppOptions & { separateServer?: number | boolean };
  poolSize?: number;
  console?: Console;
}

export type WebSocketHandler = (ws: WebSocket) => void | WebSocketBehavior;

export interface IWebsocketRoute {
  path: RecognizedString;
  options: WebSocketBehavior;
}
