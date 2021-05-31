import {
  AppOptions,
  RecognizedString,
  WebSocket,
  WebSocketBehavior
} from 'uWebSockets.js';

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
