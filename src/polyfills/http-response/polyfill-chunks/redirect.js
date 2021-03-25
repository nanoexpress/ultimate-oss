import { __request } from '../../../constants.js';

// eslint-disable-next-line complexity
export default function redirect(code, path) {
  const req = this[__request];
  const host = req.headers && req.headers.host;
  const protocol = (req.connection && req.connection.protocol) || 'http';

  if (!path && typeof code === 'string') {
    path = code;
    code = 301;
  }
  if (path && path.indexOf('/') === -1) {
    path = `/${path}`;
  }

  this.status(code);
  this.writeHeader('Location', host ? `${protocol}://${host}${path}` : path);
  this.end();

  return this;
}
