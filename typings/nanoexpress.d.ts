import type { INanoexpressOptions } from '../types/nanoexpress';
import App from './app';
import { exposeWebsocket } from './exposes';
import { useCallback, useEffect, useMemo, useRef, useState } from './hooks';
import Router from './router';
declare function nanoexpress(options?: INanoexpressOptions): App;
declare namespace nanoexpress {
    export { Router };
    export { App };
    export { exposeWebsocket };
}
export { nanoexpress as default, useCallback, useEffect, useMemo, useRef, useState };
//# sourceMappingURL=nanoexpress.d.ts.map