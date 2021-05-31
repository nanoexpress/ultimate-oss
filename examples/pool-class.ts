/* eslint-disable max-classes-per-file */
import uWS from 'uWebSockets.js';

class HttpResponse {
  protected res: uWS.HttpResponse | null;

  protected done: boolean;

  public aborted: boolean;

  constructor() {
    this.res = null;
    this.done = false;
    this.aborted = false;
  }

  setResponse(res: uWS.HttpResponse): this {
    this.res = res;
    this.done = false;
    this.aborted = res.aborted || false;

    return this;
  }

  end(body?: uWS.RecognizedString): uWS.HttpResponse | null {
    if (!this.done && this.res) {
      const res = this.res.end(body);
      this.done = true;
      return res;
    }
    return null;
  }
}

interface IHttpResponsesPool {
  create: () => HttpResponse;
  free: (pool: HttpResponse) => void;
}
const httpResponsesPool: IHttpResponsesPool = ((): IHttpResponsesPool => {
  const _pools: HttpResponse[] = [];

  return {
    create(): HttpResponse {
      if (_pools.length > 0) {
        return _pools.shift() as HttpResponse;
      }

      return new HttpResponse();
    },
    free(pool: HttpResponse): void {
      _pools.push(pool);
    }
  };
})();

const app = uWS.App();

app.get('/', (res) => {
  const _res = httpResponsesPool.create();
  _res.setResponse(res);

  res.end('');
  httpResponsesPool.free(_res);
});

app.listen(4000, () => console.log('listening at 4000'));
