import http from 'http';

export default function status(code) {
  // Quick return as it's default HTTPResponse Status
  if (code === 200 || code === '200 OK') {
    // Do nothing... ;)
  } else if (typeof code === 'string') {
    this.writeStatus(code);
    this.statusCode = code;
    this.rawStatusCode = parseInt(code);
  } else if (http.STATUS_CODES[code] !== undefined) {
    const statusCode = code + ' ' + http.STATUS_CODES[code];
    this.writeStatus(statusCode);
    this.statusCode = statusCode;
    this.rawStatusCode = code;
  } else {
    throw new Error('Invalid Code: ' + JSON.stringify(code));
  }

  return this;
}
