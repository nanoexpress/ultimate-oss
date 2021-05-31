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
  protected res: uWS.HttpResponse | null;

  protected done: boolean;

  public aborted: boolean;

  // Expose functionality properties
  protected headers: Record<string, string | number | boolean | null> | null;

  public statusCode: number;

  constructor() {
    this.res = null;
    this.done = false;
    this.aborted = false;

    this.headers = {};
    this.statusCode = 200;
  }

  /**
   * Set new HttpResponse for current pool
   * @param {uWS.HttpResponse} res Native uWS.HttpResponse instance
   * @returns {nanoexpress.HttpResponse} HttpResponse instance
   * @memberof nanoexpress.HttpResponse
   * @example res.setResponse(res)
   */
  setResponse(res: uWS.HttpResponse): this {
    this.res = res;
    this.done = false;
    this.aborted = res.aborted || false;

    this.headers = null;
    this.statusCode = 200;

    return this;
  }

  // Native methods re-implementing
  /**
   * Ends this response by copying the contents of body.
   * @param {String=} body Body content
   * @returns {uWS.HttpResponse | null} Native uWS.HttpResponse instance
   * @memberof nanoexpress.HttpResponse
   * @example res.end('text');
   */
  end(body?: uWS.RecognizedString): uWS.HttpResponse | undefined {
    if (!this.done && this.res) {
      const res = this.res.end(body);
      this.done = true;
      return res;
    }
    return undefined;
  }

  /**
   *
   * Exposed methods
   */

  /**
   * Get response header value by key
   * @param {String} key Header key
   * @returns {String | Number | Boolean | null} Returns value of header got by key
   * @memberof nanoexpress.HttpResponse
   * @example getHeader('cookie');
   */
  getHeader(key: string): string | number | boolean | null {
    if (this.headers) {
      return this.headers[key];
    }
    return null;
  }

  /**
   * Checks response header value by key
   * @param {String} key Header key
   * @returns {Boolean} Returns `true` if header exists whereas `false` in other cases
   * @memberof nanoexpress.HttpResponse
   * @example hasHeader('cookie');
   */
  hasHeader(key: string): boolean {
    return this.getHeader(key) !== null;
  }

  /**
   * Set response header value by key
   * @param {String} key Header key
   * @param {string | number | boolean} value Header value
   * @returns {nanoexpress.HttpResponse} HttpResponse instance
   * @memberof nanoexpress.HttpResponse
   * @example res.setHeader('content-type', 'application/json');
   */
  setHeader(key: string, value: string | number | boolean): this {
    if (!this.headers) {
      this.headers = {};
    }

    this.headers[key] = value;

    return this;
  }

  setHeaders(headers: Record<string, string | number | boolean>): this {
    if (this.headers) {
      Object.assign(this.headers, headers);
    } else {
      this.headers = headers;
    }

    return this;
  }

  removeHeader(key: string): this {
    if (this.headers && this.headers[key]) {
      this.headers[key] = null;
    }

    return this;
  }
}

export default HttpResponse;
