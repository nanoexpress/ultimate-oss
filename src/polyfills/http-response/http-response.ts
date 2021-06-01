import uWS from 'uWebSockets.js';

/**
 * HttpResponse class
 * @constructor
 * @class
 * @namespace nanoexpress.HttpResponse
 * @memberof nanoexpress
 * @example new HttpResponse().setResponse(uWS.HttpResponse)
 */
class HttpResponse {
  protected req: uWS.HttpRequest | null;

  protected res: uWS.HttpResponse | null;

  public done: boolean;

  public aborted: boolean;

  protected _onAborted: (() => void)[];

  protected exposedOnAbort: boolean;

  // Expose functionality properties
  protected headers: Record<string, string | number | boolean | null> | null;

  public statusCode: number;

  constructor() {
    this.req = null;
    this.res = null;
    this.done = false;
    this.aborted = false;
    this._onAborted = [];
    this.exposedOnAbort = false;

    this.headers = {};
    this.statusCode = 200;
  }

  /**
   * Set new HttpResponse for current pool
   * @param res Native uWS.HttpResponse instance
   * @returns HttpResponse instance
   * @example res.setResponse(res)
   */
  setResponse(res: uWS.HttpResponse, req?: uWS.HttpRequest): this {
    if (req) {
      this.req = req;
    }
    this.res = res;
    this.done = false;
    this.aborted = res.aborted || false;
    this._onAborted.length = 0;

    this.headers = null;
    this.statusCode = 200;

    return this;
  }

  // Native methods re-implementing
  /**
   * Ends this response by copying the contents of body.
   * @param body Body content
   * @returns Native uWS.HttpResponse instance
   * @example res.end('text');
   */
  end(body?: uWS.RecognizedString): this {
    if (!this.done && this.res) {
      this.res.end(body);
      this.done = true;
      return this;
    }
    return this;
  }

  /**
   * Enters or continues chunked encoding mode. Writes part of the response. End with zero length write.
   * @param chunk Content response chunk
   * @returns Native uWS.HttpResponse instance
   * @example res.write(Buffer.from('Hi'));
   */
  write(chunk: uWS.RecognizedString | ArrayBuffer): this {
    if (!this.done && this.res) {
      this.res.write(chunk);
      this.done = true;
      return this;
    }
    return this;
  }

  /**
   *
   * Exposed methods
   */
  exposeAborted(): this {
    if (!this.exposedOnAbort && this.res) {
      this.res.onAborted(() => {
        this.aborted = true;
        this._onAborted.forEach((callback) => callback());
      });
      this.exposedOnAbort = true;
    }

    return this;
  }

  /**
   * Get response header value by key
   * @param key Header key
   * @returns Returns value of header got by key
   * @example res.getHeader('cookie');
   */
  getHeader(key: string): string | number | boolean | null {
    if (this.headers) {
      return this.headers[key];
    }
    return null;
  }

  /**
   * Checks response header value by key
   * @param key Header key
   * @returns Returns `true` if header exists whereas `false` in other cases
   * @example res.hasHeader('cookie');
   */
  hasHeader(key: string): boolean {
    return this.getHeader(key) !== null;
  }

  /**
   * Set response header value by key
   * @param key Header key
   * @param value Header value
   * @returns HttpResponse instance
   * @example res.res.setHeader('content-type', 'application/json');
   */
  setHeader(key: string, value: string | number | boolean): this {
    if (!this.headers) {
      this.headers = {};
    }

    this.headers[key] = value;

    return this;
  }

  /**
   * Set response headers by Record dict
   * @param headers Header key/value record dict
   * @returns HttpResponse instance
   * @example res.setHeaders({'content-type':'application/json'});
   */
  setHeaders(headers: Record<string, string | number | boolean>): this {
    if (this.headers) {
      Object.assign(this.headers, headers);
    } else {
      this.headers = headers;
    }

    return this;
  }

  /**
   * Remove response header value by key
   * @param key Header key
   * @returns HttpResponse instance
   * @example res.removeHeader('cookie');
   */
  removeHeader(key: string): this {
    if (this.headers && this.headers[key]) {
      this.headers[key] = null;
    }

    return this;
  }
}

export default HttpResponse;
