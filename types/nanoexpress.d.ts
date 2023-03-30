import {
  AppOptions,
  RecognizedString,
  WebSocket,
  WebSocketBehavior
} from 'uWebSockets.js';

export interface INanoexpressOptions {
  http?: AppOptions;
  https?: AppOptions & { separateServer?: number | boolean };
  ignoreTrailingSlash: boolean;
  enableExpressCompatibility: boolean;
  poolSize?: number;
  console?: Console;
  json_spaces?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json_replacer?: (this: any, key: string, value: any) => any;
  responseMode: 'immediate' | 'queue' | 'cork';
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'DEL' | 'ANY';

export type WebSocketHandler<T> = (
  ws: WebSocket<T>
) => void | WebSocketBehavior<T>;

export interface IWebsocketRoute<UserData = unknown> {
  path: RecognizedString;
  options: WebSocketBehavior<UserData>;
}
