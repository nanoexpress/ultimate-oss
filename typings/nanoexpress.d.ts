import { INanoexpressOptions } from '../types/nanoexpress';
import App from './app';
import { exposeWebsocket } from './exposes/index';
import Router from './router';
declare const nanoexpress: {
    (options?: INanoexpressOptions): App;
    Router: typeof Router;
    App: typeof App;
    exposeWebsocket: typeof exposeWebsocket;
};
export default nanoexpress;
//# sourceMappingURL=nanoexpress.d.ts.map