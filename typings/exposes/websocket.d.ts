import { HttpRequest, HttpResponse, WebSocketBehavior } from 'uWebSockets.js';
export default function exposeWebsocket(handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>, options?: {}): WebSocketBehavior;
//# sourceMappingURL=websocket.d.ts.map