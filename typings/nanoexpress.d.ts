import { INanoexpressOptions } from '../types/nanoexpress';
import App from './app';
import { exposeWebsocket } from './exposes/index';
import { useCallback, useEffect, useMemo, useRef, useState } from './hooks';
import Router from './router';
declare const nanoexpress: {
    (options?: INanoexpressOptions): App;
    Router: typeof Router;
    App: typeof App;
    exposeWebsocket: typeof exposeWebsocket;
};
export { nanoexpress as default, useCallback, useEffect, useMemo, useRef, useState };
//# sourceMappingURL=nanoexpress.d.ts.map