import { HttpRequest, HttpResponse, WebSocketBehavior, WebSocket } from 'uWebSockets.js';
interface IWebSocket<UserData> extends WebSocket<UserData> {
    on(eventName: 'connection' | 'error' | 'upgrade' | 'willUpgrade' | 'upgraded' | 'message' | 'drain' | 'close', listener: (...args: any[]) => void): void;
    emit(eventName: 'message', message: ArrayBuffer, isBinary: boolean): void;
    emit(eventName: 'connection', ws: IWebSocket<UserData>): void;
    emit(eventName: 'drain', drained: number): void;
    emit(eventName: 'close', code: number, message: ArrayBuffer): void;
}
type WebSocketOptions<UserData> = Omit<WebSocketBehavior<UserData>, 'open' | 'message' | 'drain' | 'close'>;
interface IWebSocketBehavior<UserData> extends WebSocketOptions<UserData> {
    open: (ws: IWebSocket<UserData>) => void;
    message: (ws: IWebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => void;
    drain: (ws: IWebSocket<UserData>) => void;
    close: (ws: IWebSocket<UserData>, code: number, message: ArrayBuffer) => void;
}
export default function exposeWebsocket<UserData>(handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>, options?: WebSocketBehavior<UserData> | WebSocketOptions<UserData>): IWebSocketBehavior<UserData> | WebSocketBehavior<UserData>;
export {};
//# sourceMappingURL=websocket.d.ts.map