import uWS from 'uWebSockets.js';
import type { INanoexpressOptions } from '../types/nanoexpress';
import App from './app';
import { exposeWebsocket } from './exposes';
import { useCallback, useEffect, useMemo, useRef, useState } from './hooks';
import Router from './router';

/**
 * Instance initializer for nanoexpress
 * @param options Instance options
 * @param options.ignoreTrailingSlash Normalizes trailing slash on routes
 * @param options.enableExpressCompatibility Sets polyfill status
 * @param options.responseMode Response mode to write to HTTP Request
 * @returns
 */
const nanoexpress = (
  userOptions: Partial<INanoexpressOptions> = {
    ignoreTrailingSlash: true,
    enableExpressCompatibility: false
  }
): App => {
  // `responseMode` must always be set, otherwise every response throws
  const options = {
    responseMode: 'cork',
    ...userOptions
  } as INanoexpressOptions;
  let app: App | undefined;

  if (options.https) {
    app = uWS.SSLApp(options.https);
  } else if (options.http) {
    app = uWS.App(options.http);
  } else {
    app = uWS.App();
  }

  return new App(options, app);
};

nanoexpress.Router = Router;
nanoexpress.App = App;

// Add exposes
nanoexpress.exposeWebsocket = exposeWebsocket;

export {
  nanoexpress as default,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
};
