import uWS, { HttpRequest } from 'uWebSockets.js';
import { HttpResponse } from '../src/polyfills';

export default (
    middleware: (
      req: HttpRequest,
      res: HttpResponse,
      next: (err?: Error, done?: boolean) => void
    ) => HttpResponse | void
  ) =>
  (req: uWS.HttpRequest, res: HttpResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (err, done) => {
        if (err) {
          reject(err);
        } else {
          resolve(done);
        }
      });
    });
